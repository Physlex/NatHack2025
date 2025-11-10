from django.shortcuts import render, get_object_or_404, redirect
from django.http import JsonResponse
from django.views.decorators.http import require_GET
from rest_framework.decorators import api_view
from rest_framework.views import APIView
from rest_framework import status
from .models import RecordingSession, TimeSeriesEntry, SpectrogramData, EventRelatedPotential
from datetime import datetime
from django.views.generic import TemplateView
from django.contrib import messages
from django.db.models import Count
import numpy as np
from scipy.fftpack import dct


class UploadFormView(TemplateView):
    template_name = 'store/upload_form.html'

    def get(self, request, *args, **kwargs):
        return render(request, self.template_name)

    def post(self, request, *args, **kwargs):
        try:
            # Get form data
            sid = request.POST.get('sid')
            segn = request.POST.get('segn')
            values_str = request.POST.get('values', '')
            
            # Parse values from comma-separated string
            values = [float(v.strip()) for v in values_str.split(',') if v.strip()]
            
            # Create or get session
            session, created = RecordingSession.objects.get_or_create(
                id=sid,
                defaults={'name': f'Session {sid}'}
            )
            
            # Create entries
            entries = []
            for value in values:
                entry = TimeSeriesEntry(
                    session=session,
                    value=value
                )
                entries.append(entry)
            
            # Bulk create entries
            TimeSeriesEntry.objects.bulk_create(entries)
            
            messages.success(request, f'Successfully uploaded {len(entries)} values for session {sid}')
            return redirect('store:upload_form')
            
        except ValueError as e:
            messages.error(request, 'Invalid data format: Please check your values are valid numbers')
        except Exception as e:
            messages.error(request, f'Error uploading data: {str(e)}')
        
        return render(request, self.template_name)


class TimeSeriesEndpointView(APIView):
    
    def get(self, request, sid):
        session = get_object_or_404(RecordingSession, id=sid)
        entries = session.entries.all().values('frequency', 'value')
        return JsonResponse({"session_id": sid, "name": session.name, "entries": list(entries)})

    def post(self, request, **kwargs):
        data = request.data
        check_keys = {"segn", "len", "values", "uid"}
        
        if not set(data.keys()) >= check_keys:
            
            return JsonResponse({"msg": "Incorrect Format", "code": status.HTTP_400_BAD_REQUEST, "keys": list(data.keys())})
                
        try:
            # Get or create the recording session
            session, created = RecordingSession.objects.create(
                defaults={'name': f'New Session {data["segn"]}'},
                user_id=data['uid']
            )
            
            # Create time series entries

            values = [int(x) for x in data.getlist('values')]
            print("here: ", data, values)
            for value in values:
                TimeSeriesEntry.objects.create(
                    frequency=value[0],
                    session=session,
                    value=value[1]
                )
            
            
            # Bulk create all entries
            # TimeSeriesEntry.objects.bulk_create(entries)
            
            return JsonResponse({
                "msg": "Data saved successfully",
                "session_id": session.id,
                "entries_count": len(values),
                "code": status.HTTP_201_CREATED
            })
        except (ValueError, TypeError) as e:
            return JsonResponse({
                "msg": f"Invalid data format: {str(e)}",
                "code": status.HTTP_400_BAD_REQUEST
            })
        except Exception as e:
            
            return JsonResponse({
                "msg": f"Server error: {str(e)}",
                "code": status.HTTP_500_INTERNAL_SERVER_ERROR
            })



# Create your views here.
class SessionsByUserView(APIView):
    """
    Return all recording sessions for a specific user (by user id).
    URL should provide `uid` as a path parameter.
    """
    def get(self, request, uid):
        try:
            sessions_qs = RecordingSession.objects.filter(user__id=uid)
            if not sessions_qs.exists():
                return JsonResponse({
                    "user_id": uid,
                    "sessions_count": 0,
                    "sessions": []
                }, status=status.HTTP_200_OK)

            # Convert queryset to JSON-serializable list of dicts
            sessions_data = []
            for s in sessions_qs:
                sessions_data.append({
                    "id": s.id,
                    "name": s.name,
                    "user_id": s.user_id,
                    "entries_count": s.entries.count(),
                })

            return JsonResponse({
                "user_id": uid,
                "sessions_count": len(sessions_data),
                "sessions": sessions_data
            }, status=status.HTTP_200_OK)
       
        except Exception as e:
            print(e)
            return JsonResponse({
                "msg": f"Server error: {str(e)}",
                "code": status.HTTP_500_INTERNAL_SERVER_ERROR
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class SpectrogramView(APIView):
    """Return spectrogram-style data for a recording session.

    Response JSON format (GET):
    {
      "session_id": <sid>,
      "frequencies": [f1, f2, ...],
      "data": [[v11, v12, ...], [v21, v22, ...], ...]
    }

    POST payloads accepted:
    - {"rows": [{"frequency": <f>, "values": [v1, v2, ...]}, ...]}
    - or {"<frequency>": [v1, v2, ...], ...}

    POST will create or update SpectrogramData rows for the session.
    """
    def get(self, request, sid):
        session = get_object_or_404(RecordingSession, id=sid)
        qs = TimeSeriesEntry.objects.filter(session=session).order_by('id')

        if not qs.exists() and not session.spectrogram_rows.exists():
            return JsonResponse({
                "session_id": sid,
                "frequencies": [],
                "data": []
            }, status=status.HTTP_200_OK)

        # If explicit spectrogram rows exist, prefer those
        if session.spectrogram_rows.exists():
            rows = session.spectrogram_rows.all().order_by('frequency')
            freqs = [r.frequency for r in rows]
            data = [r.values for r in rows]
            return JsonResponse({"session_id": sid, "frequencies": freqs, "data": data}, status=status.HTTP_200_OK)

        # Fallback: build from TimeSeriesEntry
        from collections import defaultdict
        freq_map = defaultdict(list)
        for e in qs:
            freq_map[float(e.frequency)].append(e.value)

        freqs = sorted(freq_map.keys())
        data = [freq_map[f] for f in freqs]

        return JsonResponse({
            "session_id": sid,
            "frequencies": freqs,
            "data": data
        }, status=status.HTTP_200_OK)

    def post(self, request, sid):
        """Create or update SpectrogramData rows for a session.

        Accepts either a `rows` list of objects or a mapping frequency->values.
        """
        session = get_object_or_404(RecordingSession, id=sid)
        payload = request.data

        # Normalize payload into list of rows
        rows = []
        if isinstance(payload, dict) and 'rows' in payload:
            rows = payload.get('rows') or []
        elif isinstance(payload, dict):
            # treat as mapping of frequency->values
            for key, val in payload.items():
                try:
                    f = float(key)
                    rows.append({'frequency': f, 'values': val})
                except ValueError:
                    # ignore non-numeric keys
                    continue
        elif isinstance(payload, list):
            rows = payload

        if not rows:
            return JsonResponse({"msg": "No spectrogram rows provided", "code": status.HTTP_400_BAD_REQUEST}, status=status.HTTP_400_BAD_REQUEST)

        created = 0
        updated = 0
        for r in rows:
            try:
                freq = float(r.get('frequency'))
                values = r.get('values')
                if values is None:
                    continue
                obj, was_created = SpectrogramData.objects.update_or_create(
                    session=session,
                    frequency=freq,
                    defaults={'values': values}
                )
                if was_created:
                    created += 1
                else:
                    updated += 1
            except Exception as e:
                # skip invalid rows
                print('spectrogram row error:', e)
                continue

        return JsonResponse({
            'session_id': sid,
            'created': created,
            'updated': updated
        }, status=status.HTTP_201_CREATED)


class ERPView(APIView):
    """List and create Event-Related Potentials for a session.

    GET /spectrogram/<sid>/erps/  -> list ERPs for session
    POST /spectrogram/<sid>/erps/ -> create ERP rows for session with JSON body
    """
    def get(self, request, sid):
        session = get_object_or_404(RecordingSession, id=sid)
        erps = session.erps.all()
        out = []
        for erp in erps:
            out.append({
                'id': erp.id,
                'latency': erp.latency,
                'event_time': erp.event_time.isoformat() if erp.event_time else None,
                'channel': erp.channel,
                'values': erp.values
            })
        return JsonResponse({'session_id': sid, 'erps': out}, status=status.HTTP_200_OK)

    def post(self, request, sid):
        session = get_object_or_404(RecordingSession, id=sid)
        data = request.data
        # Expect either a single ERP or a list of ERPs
        items = data if isinstance(data, list) else [data]
        created = []
        for itm in items:
            latency = itm.get('latency')
            event_time = itm.get('event_time')
            channel = itm.get('channel')
            values = itm.get('values')
            erp = EventRelatedPotential.objects.create(
                session=session,
                latency=latency,
                event_time=event_time,
                channel=channel,
                values=values
            )
            created.append({'id': erp.id, 'channel': erp.channel})
        return JsonResponse({'created': created}, status=status.HTTP_201_CREATED)


class MFCCView(APIView):
    """Compute MFCCs for a session's time-series data.

    GET /spectrogram/<sid>/mfcc/?n_mfcc=13
    """
    def get(self, request, sid):
        session = get_object_or_404(RecordingSession, id=sid)
        # collect raw values across entries ordered by id
        qs = TimeSeriesEntry.objects.filter(session=session).order_by('id')
        if not qs.exists():
            return JsonResponse({"session_id": sid, "mfcc": []}, status=status.HTTP_200_OK)

        values = np.array([e.value for e in qs], dtype=float)
        n_mfcc = int(request.GET.get('n_mfcc', 13))

        # simple MFCC-like computation: framing + FFT + Mel filterbank + DCT
        try:
            # framing parameters
            frame_len = 256
            hop = frame_len // 2
            def framesig(sig, frame_len, hop):
                num_frames = 1 + (len(sig) - frame_len) // hop if len(sig) >= frame_len else 0
                frames = np.zeros((num_frames, frame_len))
                for i in range(num_frames):
                    start = i * hop
                    frames[i] = sig[start:start+frame_len]
                return frames

            frames = framesig(values, frame_len, hop)
            if frames.shape[0] == 0:
                return JsonResponse({"session_id": sid, "mfcc": []}, status=status.HTTP_200_OK)

            # windowing
            frames *= np.hamming(frame_len)
            NFFT = 512
            mag_frames = np.absolute(np.fft.rfft(frames, NFFT))
            pow_frames = (1.0 / NFFT) * (mag_frames ** 2)

            # mel filterbank
            nfilt = 26
            low_freq_mel = 0
            high_freq_mel = 2595 * np.log10(1 + (np.max(values) if np.max(values) > 0 else 8000) / 700.0)
            mel_points = np.linspace(low_freq_mel, high_freq_mel, nfilt + 2)
            hz_points = 700 * (10**(mel_points / 2595.0) - 1)
            bin_indexes = np.floor((NFFT + 1) * hz_points / 8000).astype(int)

            fbank = np.zeros((nfilt, int(NFFT/2 + 1)))
            for m in range(1, nfilt + 1):
                f_m_minus = bin_indexes[m - 1]
                f_m = bin_indexes[m]
                f_m_plus = bin_indexes[m + 1]

                for k in range(f_m_minus, f_m):
                    fbank[m - 1, k] = (k - f_m_minus) / (f_m - f_m_minus)
                for k in range(f_m, f_m_plus):
                    fbank[m - 1, k] = (f_m_plus - k) / (f_m_plus - f_m)

            filter_banks = np.dot(pow_frames, fbank.T)
            filter_banks = np.where(filter_banks == 0, np.finfo(float).eps, filter_banks)
            filter_banks = 20 * np.log10(filter_banks)

            # DCT to get MFCCs
            mfcc = dct(filter_banks, type=2, axis=1, norm='ortho')[:, :n_mfcc]
            # convert to python lists for JSON
            mfcc_list = mfcc.tolist()
            mfcc_mean = np.mean(mfcc, axis=0)
            mfcc_std = np.std(mfcc, axis=0)
            mfcc_features = {
                'mean': mfcc_mean.tolist(),
                'std': mfcc_std.tolist()
            }

            return JsonResponse({"session_id": sid, "mfcc": mfcc_features}, status=status.HTTP_200_OK)
        except Exception as e:
            print('mfcc error', e)
            return JsonResponse({"msg": f"Error computing MFCCs: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)