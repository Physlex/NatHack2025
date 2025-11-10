from django.core.management.base import BaseCommand
from store.models import RecordingSession, TimeSeriesEntry, SpectrogramData, EventRelatedPotential
from django.contrib.auth import get_user_model
import random
import math

User = get_user_model()

class Command(BaseCommand):
    help = 'Populate the database with mock recording sessions, time-series and spectrogram data'

    def add_arguments(self, parser):
        parser.add_argument('--users', type=int, default=3, help='Number of mock users to create')
        parser.add_argument('--sessions-per-user', type=int, default=2, help='Number of sessions per user')
        parser.add_argument('--frequencies', type=int, default=10, help='Number of frequency bins per session')
        parser.add_argument('--frames', type=int, default=50, help='Number of time frames per frequency')

    def handle(self, *args, **options):
        users_n = options['users']
        sessions_per = options['sessions_per_user']
        freqs = options['frequencies']
        frames = options['frames']

        # Create mock users
        users = []
        for i in range(users_n):
            u, created = User.objects.get_or_create(username=f'mockuser{i}', defaults={'email': f'mock{i}@example.com'})
            users.append(u)

        for u in users:
            for s_idx in range(sessions_per):
                session = RecordingSession.objects.create(name=f'Mock Session {u.username}-{s_idx}', user=u)

                # Create time series entries across multiple frequencies
                entries = []
                freqs_list = [50 + i*10 for i in range(freqs)]
                for frame in range(frames):
                    for f in freqs_list:
                        # Create a synthetic value (e.g., a sine-modulated amplitude)
                        val = math.sin((frame/frames) * 2 * math.pi * (f/100.0)) + random.uniform(-0.1, 0.1)
                        entries.append(TimeSeriesEntry(session=session, frequency=float(f), value=val))

                TimeSeriesEntry.objects.bulk_create(entries)

                # Create SpectrogramData rows per frequency
                for f in freqs_list:
                    # collect values for this frequency
                    values = [e.value for e in TimeSeriesEntry.objects.filter(session=session, frequency=float(f)).order_by('id')]
                    SpectrogramData.objects.create(session=session, frequency=float(f), values=values)

                # Create mock Event-Related Potentials (ERP) for this session
                channels = ['Cz', 'Pz', 'Fz']
                erp_count = 5
                for ch in channels:
                    for ev in range(erp_count):
                        latency = random.uniform(0.05, 0.4)  # seconds
                        # generate a smooth ERP-like waveform (Gaussian-shaped) of length `frames`
                        erp_values = []
                        for t in range(frames):
                            x = (t - frames*0.5) / (frames*0.15)
                            waveform = math.exp(-0.5 * (x**2)) * (1.0 / (1 + ev*0.1))
                            waveform += random.uniform(-0.02, 0.02)
                            erp_values.append(waveform)
                        EventRelatedPotential.objects.create(session=session, latency=latency, channel=ch, values=erp_values)

        self.stdout.write(self.style.SUCCESS('Mock data populated'))
