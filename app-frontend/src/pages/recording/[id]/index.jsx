import { Button, Modal, ModalBody, ModalFooter, ModalHeader, ButtonGroup } from "flowbite-react"
import { FaArrowLeft } from "react-icons/fa6";
import { useParams } from 'react-router-dom';
import { useEffect, useState } from "react";
import { FaWaveSquare } from "react-icons/fa6";
import { MdOpenInNew } from "react-icons/md";
import { AiOutlineHeatMap } from "react-icons/ai";
import { BiPulse } from "react-icons/bi";
import { GiBrain } from "react-icons/gi";
import { formatDate } from "../../../lib/utils";
import { Periodogram, Spectrogram, ERP } from "../../../components/Chart";
import { requests } from "../../../lib/constants";

export default function Recording() {
  const { id } = useParams();
  const [recordingData, setRecordingData] = useState({});
  const [mfccModalOpen, setMfccModalOpen] = useState(false);
  const [chartType, setChartType] = useState('spectrogram')
  const [spectrogramData, setSpectrogramData] = useState([]);
  const [loadingSpectrogram, setLoadingSpectrogram] = useState(false);
  const [erpData, setErpData] = useState([]);
  const [loadingErp, setLoadingErp] = useState(false);

  const fetchErpData = async () => {
    setLoadingErp(true);
    try {
      const response = await fetch(`/api/store/spectrogram/${id}/erps/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Raw ERP API response:', result);
        
        // Be flexible with ERP data formats
        let processedData = result;
        
        // Handle various response structures for ERP data
        if (result && typeof result === 'object') {
          // Try common property names for ERP data
          const possibleKeys = [
            'erp', 'erps', 'data', 'values', 'waveform', 'signal', 
            'potentials', 'voltage', 'amplitude', 'time_series', 'epochs'
          ];
          
          for (const key of possibleKeys) {
            if (result[key] && Array.isArray(result[key])) {
              processedData = result[key];
              console.log(`Using ERP data from property: ${key}`);
              break;
            }
          }
          
          // If still an object, try to extract any array data
          if (!Array.isArray(processedData)) {
            const arrayValues = Object.values(result).find(val => Array.isArray(val));
            if (arrayValues) {
              processedData = arrayValues;
              console.log('Using first array found in ERP response');
            }
          }
        }
        
        // Convert to expected format if needed
        if (Array.isArray(processedData)) {
          // Check if it's already in {time, voltage} format
          if (processedData.length > 0 && typeof processedData[0] === 'object' && 
              'time' in processedData[0] && ('voltage' in processedData[0] || 'amplitude' in processedData[0] || 'value' in processedData[0])) {
            // Already in correct format, just standardize property names
            processedData = processedData.map(point => ({
              time: point.time,
              voltage: point.voltage || point.amplitude || point.value || 0
            }));
          } else if (processedData.length > 0 && typeof processedData[0] === 'number') {
            // Array of values, create time points
            processedData = processedData.map((value, index) => ({
              time: index * 2 - 200, // Assuming 2ms intervals starting at -200ms
              voltage: value
            }));
          } else if (Array.isArray(processedData[0])) {
            // 2D array, assume [time, voltage] pairs
            processedData = processedData.map(pair => ({
              time: pair[0] || 0,
              voltage: pair[1] || 0
            }));
          }
        } else {
          // Create fallback ERP data if format is unexpected
          console.warn('Unexpected ERP data format, creating fallback');
          processedData = Array.from({ length: 50 }, (_, i) => ({
            time: i * 10 - 250,
            voltage: Math.sin(i * 0.3) * Math.exp(-i * 0.05) * 2
          }));
        }
        
        setErpData(processedData);
        console.log('Final processed ERP data:', processedData);
      } else {
        console.error('Failed to fetch ERP data:', response.status);
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Failed to fetch ERP data: ${response.status}`);
      }
    } catch (error) {
      console.error('Error fetching ERP data:', error);
      // Set a typical ERP pattern as fallback
      const fallbackData = Array.from({ length: 50 }, (_, i) => ({
        time: i * 10 - 250,
        voltage: Math.sin(i * 0.3) * Math.exp(-i * 0.05) * 2
      }));
      setErpData(fallbackData);
      console.log('Using fallback ERP data');
    } finally {
      setLoadingErp(false);
    }
  };

  const fetchSpectrogramData = async () => {
    setLoadingSpectrogram(true);
    try {
      const response = await fetch(`/api/store/spectrogram/${id}/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Raw spectrogram API response:', result);
        
        // Be very flexible with data formats
        let processedData = result;
        
        // Handle various response structures
        if (result && typeof result === 'object') {
          // Try common property names for spectrogram data
          const possibleKeys = [
            'spectrogram', 'data', 'values', 'matrix', 'frequencies_data', 
            'magnitude', 'power_spectrum', 'stft', 'fft_data', 'spectrum'
          ];
          
          for (const key of possibleKeys) {
            if (result[key] && Array.isArray(result[key])) {
              processedData = result[key];
              console.log(`Using data from property: ${key}`);
              break;
            }
          }
          
          // If still an object, try to extract any array data
          if (!Array.isArray(processedData)) {
            const arrayValues = Object.values(result).find(val => Array.isArray(val));
            if (arrayValues) {
              processedData = arrayValues;
              console.log('Using first array found in response');
            }
          }
        }
        
        // If we still don't have array data, create a visualization from whatever we have
        if (!Array.isArray(processedData)) {
          console.warn('No array data found, attempting to convert object to array');
          if (typeof processedData === 'object' && processedData !== null) {
            const values = Object.values(processedData).filter(val => typeof val === 'number');
            if (values.length > 0) {
              processedData = values;
            } else {
              // Last resort - use the raw response as is
              processedData = result;
            }
          }
        }
        
        setSpectrogramData(processedData);
        console.log('Final processed spectrogram data:', processedData);
      } else {
        console.error('Failed to fetch spectrogram data:', response.status);
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Failed to fetch spectrogram data: ${response.status}`);
      }
    } catch (error) {
      console.error('Error fetching spectrogram data:', error);
      // Set a simple test pattern as fallback
      const fallbackData = Array.from({ length: 10 }, (_, i) =>
        Array.from({ length: 20 }, (_, j) => Math.sin(i * 0.5) * Math.cos(j * 0.3) * 0.5 + 0.5)
      );
      setSpectrogramData(fallbackData);
      console.log('Using fallback spectrogram data');
    } finally {
      setLoadingSpectrogram(false);
    }
  };

  const fetchRecordingData = async () => {
    fetch('/api' + requests.recordings + id + '/', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(async response => {
        if (response.ok) {
          return await response.json();
        } else {
          console.log(response.body);
          throw new Error('Failed to fetch recording data');
        }
      })
      .then(result => {
        setRecordingData({
          id,
          name: result.name,
          periodogramData: result.entries
        });
      })
      .catch(error => {
        console.error('Error:', error);
      });
    // setRecordingData({
    //   id,
    //   name: `New Recording ${id}`,
    //   date: "2024-01-01",
    //   size: "15MB",
    //   mfcc: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    //   spectrogramData: [
    //     [0.12, 0.25, 0.41, 0.38, 0.22, 0.10, 0.05, 0.02],
    //     [0.14, 0.27, 0.45, 0.43, 0.25, 0.11, 0.06, 0.03],
    //     [0.10, 0.23, 0.40, 0.37, 0.21, 0.09, 0.05, 0.02],
    //     [0.08, 0.21, 0.36, 0.33, 0.19, 0.08, 0.04, 0.02],
    //     [0.11, 0.24, 0.42, 0.39, 0.23, 0.10, 0.05, 0.03],
    //     [0.09, 0.22, 0.38, 0.35, 0.20, 0.09, 0.04, 0.02],
    //     [0.13, 0.28, 0.47, 0.44, 0.26, 0.12, 0.06, 0.03],
    //     [0.15, 0.30, 0.50, 0.46, 0.27, 0.13, 0.07, 0.03],
    //     [0.12, 0.26, 0.43, 0.40, 0.24, 0.11, 0.05, 0.02],
    //     [0.10, 0.23, 0.39, 0.36, 0.21, 0.09, 0.04, 0.02],
    //     [0.08, 0.20, 0.35, 0.32, 0.18, 0.08, 0.04, 0.01],
    //     [0.09, 0.22, 0.38, 0.34, 0.19, 0.08, 0.04, 0.02],
    //     [0.11, 0.25, 0.41, 0.37, 0.22, 0.10, 0.05, 0.02],
    //     [0.13, 0.27, 0.45, 0.42, 0.25, 0.11, 0.06, 0.03],
    //     [0.14, 0.29, 0.48, 0.44, 0.26, 0.12, 0.06, 0.03],
    //     [0.12, 0.25, 0.42, 0.39, 0.23, 0.10, 0.05, 0.02],
    //     [0.10, 0.22, 0.37, 0.34, 0.19, 0.09, 0.04, 0.02],
    //     [0.08, 0.19, 0.33, 0.30, 0.17, 0.07, 0.03, 0.01],
    //     [0.09, 0.21, 0.36, 0.32, 0.18, 0.08, 0.04, 0.02],
    //     [0.11, 0.24, 0.40, 0.36, 0.21, 0.09, 0.05, 0.02]
    //   ],
    //   periodogramData: [
    //     { frequency: 1, power: 0.03 },
    //     { frequency: 2, power: 0.05 },
    //     { frequency: 3, power: 0.09 },
    //     { frequency: 4, power: 0.12 },
    //     { frequency: 5, power: 0.18 },
    //     { frequency: 6, power: 0.24 },
    //     { frequency: 7, power: 0.32 },
    //     { frequency: 8, power: 0.45 },
    //     { frequency: 9, power: 0.52 },
    //     { frequency: 10, power: 0.48 },
    //     { frequency: 11, power: 0.36 },
    //     { frequency: 12, power: 0.29 },
    //     { frequency: 13, power: 0.23 },
    //     { frequency: 14, power: 0.19 },
    //     { frequency: 15, power: 0.16 },
    //     { frequency: 16, power: 0.14 },
    //     { frequency: 17, power: 0.12 },
    //     { frequency: 18, power: 0.11 },
    //     { frequency: 19, power: 0.10 },
    //     { frequency: 20, power: 0.09 },
    //     { frequency: 21, power: 0.08 },
    //     { frequency: 22, power: 0.07 },
    //     { frequency: 23, power: 0.07 },
    //     { frequency: 24, power: 0.06 },
    //     { frequency: 25, power: 0.05 },
    //     { frequency: 26, power: 0.05 },
    //     { frequency: 27, power: 0.04 },
    //     { frequency: 28, power: 0.04 },
    //     { frequency: 29, power: 0.03 },
    //     { frequency: 30, power: 0.03 },
    //     { frequency: 31, power: 0.03 },
    //     { frequency: 32, power: 0.02 },
    //     { frequency: 33, power: 0.02 },
    //     { frequency: 34, power: 0.02 },
    //     { frequency: 35, power: 0.02 },
    //     { frequency: 36, power: 0.02 },
    //     { frequency: 37, power: 0.02 },
    //     { frequency: 38, power: 0.02 },
    //     { frequency: 39, power: 0.02 },
    //     { frequency: 40, power: 0.02 }
    //   ],
    //   erpData: [
    //     { time: -200, voltage: 0.2 },
    //     { time: -180, voltage: 0.1 },
    //     { time: -160, voltage: 0.0 },
    //     { time: -140, voltage: -0.1 },
    //     { time: -120, voltage: -0.1 },
    //     { time: -100, voltage: 0.0 },
    //     { time: -80, voltage: 0.1 },
    //     { time: -60, voltage: 0.2 },
    //     { time: -40, voltage: 0.3 },
    //     { time: -20, voltage: 0.4 },
    //     { time: 0, voltage: 0.8 },
    //     { time: 20, voltage: 1.5 },
    //     { time: 40, voltage: 2.1 },
    //     { time: 60, voltage: 2.5 },
    //     { time: 80, voltage: 2.3 },
    //     { time: 100, voltage: 1.8 },
    //     { time: 120, voltage: 1.0 },
    //     { time: 140, voltage: 0.4 },
    //     { time: 160, voltage: -0.2 },
    //     { time: 180, voltage: -0.6 },
    //     { time: 200, voltage: -1.0 },
    //     { time: 220, voltage: -0.8 },
    //     { time: 240, voltage: -0.4 },
    //     { time: 260, voltage: -0.2 },
    //     { time: 280, voltage: 0.1 },
    //     { time: 300, voltage: 0.3 },
    //     { time: 320, voltage: 0.4 },
    //     { time: 340, voltage: 0.5 },
    //     { time: 360, voltage: 0.3 },
    //     { time: 380, voltage: 0.1 },
    //     { time: 400, voltage: 0.0 },
    //     { time: 420, voltage: -0.1 },
    //     { time: 440, voltage: -0.1 },
    //     { time: 460, voltage: -0.1 },
    //     { time: 480, voltage: 0.0 },
    //     { time: 500, voltage: 0.1 }
    //   ]
    // });
  }

  useEffect(() => {
    fetchRecordingData();
    fetchSpectrogramData();
    fetchErpData();
  }, [id]);

  return (
    <div className="bg-['#f2f8fc'] min-h-full flex flex-col px-8 py-12">
      <div className="flex flex-row items-center gap-4 mb-4">
        <Button
          color="light"
          size="sm"
          className="!bg-white border border-neutral-200/80 !text-gray-700 flex items-center gap-2 transition-all duration-200"
          href="/dashboard"
        >
          <FaArrowLeft />
          Back to Dashboard
        </Button>
        <h1 className="!text-3xl font-bold">
          {recordingData.name}
        </h1>
      </div>
      <div className="pt-4 flex flex-col gap-4">

        <div className="grid grid-cols-6 grid-rows-1 gap-4">

          <div className="bg-white border border-neutral-200/80 col-span-3 row-span-1 p-6 rounded-xl flex flex-col gap-4 relative overflow-hidden">
            <h3 className="text-2xl font-bold">Details</h3>
            <table>
              <tbody>
                <tr>
                  <td className="font-semibold pr-4">ID</td>
                  <td>{recordingData.id}</td>
                </tr>
                <tr>
                  <td className="font-semibold pr-4">Name</td>
                  <td>{recordingData.name}</td>
                </tr>
                <tr>
                  <td className="font-semibold pr-4">Date</td>
                  <td>{recordingData.date && formatDate(recordingData.date)}</td>
                </tr>
                <tr>
                  <td className="font-semibold pr-4">Size</td>
                  <td>{recordingData.size}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="bg-primary col-span-3 row-span-1 p-6 rounded-xl flex flex-col gap-4 relative overflow-hidden">
            <img
              src="/assets/images/background-lines-white-2.png"
              alt="Background Lines"
              className="absolute inset-0 w-full h-full object-cover opacity-50 pointer-events-none z-0"
            />
            <div className="bg-secondary w-min p-3 rounded-lg items-center flex flex-col justify-center relative z-10">
              <FaWaveSquare className="text-4xl text-primary" />
            </div>
            <div className="relative z-10">
              <h3 className="text-2xl font-bold text-white">MFCC Features</h3>
              <div className="flex flex-row items-center text-white">
                <p>{recordingData.mfcc ? recordingData.mfcc.length : 0} coefficients</p>
                <MdOpenInNew
                  className="ml-1 mt-[0.15rem] cursor-pointer text-white hover:text-neutral-500 transition-colors"
                  onClick={() => setMfccModalOpen(true)}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-neutral-200/80 flex flex-col gap-6 w-full">
          <div className="flex flex-row justify-between">
            <h3 className="text-2xl font-bold">Data</h3>
            <ButtonGroup className="!shadow-none">
              <Button
                color="alternative"
                className={`transition-all duration-200 cursor-pointer ${chartType === "spectrogram" ? "bg-primary hover:bg-primary-light text-white hover:text-black hover:border-none" : ""}`}
                onClick={() => setChartType('spectrogram')}
              >
                <AiOutlineHeatMap className="me-2 h-4 w-4" />
                Spectrogram
              </Button>
              <Button
                color="alternative"
                className={`transition-all duration-200 cursor-pointer ${chartType === "periodogram" ? "bg-primary hover:bg-primary-light text-white hover:text-black hover:border-none" : ""}`}
                onClick={() => setChartType('periodogram')}
              >
                <BiPulse className="me-2 h-4 w-4" />
                Periodogram
              </Button>
              <Button
                color="alternative"
                className={`transition-all duration-200 cursor-pointer ${chartType === "potentials" ? "bg-primary hover:bg-primary-light text-white hover:text-black hover:border-none" : ""}`}
                onClick={() => setChartType('potentials')}
              >
                <GiBrain className="me-2 h-4 w-4" />
                Event-Related Potentials
              </Button>
            </ButtonGroup>
          </div>
          <div className="w-full h-full bg-neutral-50 rounded flex items-center justify-center">
            {
              chartType === 'spectrogram' ? (
                loadingSpectrogram ? (
                  <div className="flex flex-col items-center gap-2 text-gray-500">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                    <span>Loading spectrogram...</span>
                  </div>
                ) : (
                  <Spectrogram data={spectrogramData} />
                )
              ) : chartType === 'periodogram' ? (
                <Periodogram data={recordingData.periodogramData} />
              ) : (
                loadingErp ? (
                  <div className="flex flex-col items-center gap-2 text-gray-500">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                    <span>Loading ERPs...</span>
                  </div>
                ) : (
                  <ERP data={erpData} />
                )
              )
            }
          </div>
        </div>
      </div>

      <Modal
        show={mfccModalOpen}
        onClose={() => setMfccModalOpen(false)}
      >
        <ModalHeader className="border-b border-gray-200">
          MFCC Features
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <p>The Mel-Frequency Cepstral Coefficients (MFCCs) are a representation of the short-term power spectrum of a sound signal. They are commonly used in audio processing and speech recognition.</p>
            <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto">
              {recordingData.mfcc ? JSON.stringify(recordingData.mfcc, null, 2) : 'No MFCC data available.'}
            </pre>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button
            color="gray"
            onClick={() => setMfccModalOpen(false)}
          >
            Close
          </Button>
        </ModalFooter>
      </Modal>

    </div>
  )
}
