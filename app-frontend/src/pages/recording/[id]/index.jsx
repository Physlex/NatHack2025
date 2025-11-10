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

export default function Recording() {
  const { id } = useParams();
  const [recordingData, setRecordingData] = useState({});
  const [mfccModalOpen, setMfccModalOpen] = useState(false);
  const [chartType, setChartType] = useState('spectrogram')

  const fetchRecordingData = async () => {
    setRecordingData({
      id,
      name: `New Recording ${id}`,
      date: "2024-01-01",
      size: "15MB",
      mfcc: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
      spectrogramData: [
        [0.12, 0.25, 0.41, 0.38, 0.22, 0.10, 0.05, 0.02],
        [0.14, 0.27, 0.45, 0.43, 0.25, 0.11, 0.06, 0.03],
        [0.10, 0.23, 0.40, 0.37, 0.21, 0.09, 0.05, 0.02],
        [0.08, 0.21, 0.36, 0.33, 0.19, 0.08, 0.04, 0.02],
        [0.11, 0.24, 0.42, 0.39, 0.23, 0.10, 0.05, 0.03],
        [0.09, 0.22, 0.38, 0.35, 0.20, 0.09, 0.04, 0.02],
        [0.13, 0.28, 0.47, 0.44, 0.26, 0.12, 0.06, 0.03],
        [0.15, 0.30, 0.50, 0.46, 0.27, 0.13, 0.07, 0.03],
        [0.12, 0.26, 0.43, 0.40, 0.24, 0.11, 0.05, 0.02],
        [0.10, 0.23, 0.39, 0.36, 0.21, 0.09, 0.04, 0.02],
        [0.08, 0.20, 0.35, 0.32, 0.18, 0.08, 0.04, 0.01],
        [0.09, 0.22, 0.38, 0.34, 0.19, 0.08, 0.04, 0.02],
        [0.11, 0.25, 0.41, 0.37, 0.22, 0.10, 0.05, 0.02],
        [0.13, 0.27, 0.45, 0.42, 0.25, 0.11, 0.06, 0.03],
        [0.14, 0.29, 0.48, 0.44, 0.26, 0.12, 0.06, 0.03],
        [0.12, 0.25, 0.42, 0.39, 0.23, 0.10, 0.05, 0.02],
        [0.10, 0.22, 0.37, 0.34, 0.19, 0.09, 0.04, 0.02],
        [0.08, 0.19, 0.33, 0.30, 0.17, 0.07, 0.03, 0.01],
        [0.09, 0.21, 0.36, 0.32, 0.18, 0.08, 0.04, 0.02],
        [0.11, 0.24, 0.40, 0.36, 0.21, 0.09, 0.05, 0.02]
      ],
      periodogramData: [
        { frequency: 1, power: 0.03 },
        { frequency: 2, power: 0.05 },
        { frequency: 3, power: 0.09 },
        { frequency: 4, power: 0.12 },
        { frequency: 5, power: 0.18 },
        { frequency: 6, power: 0.24 },
        { frequency: 7, power: 0.32 },
        { frequency: 8, power: 0.45 },
        { frequency: 9, power: 0.52 },
        { frequency: 10, power: 0.48 },
        { frequency: 11, power: 0.36 },
        { frequency: 12, power: 0.29 },
        { frequency: 13, power: 0.23 },
        { frequency: 14, power: 0.19 },
        { frequency: 15, power: 0.16 },
        { frequency: 16, power: 0.14 },
        { frequency: 17, power: 0.12 },
        { frequency: 18, power: 0.11 },
        { frequency: 19, power: 0.10 },
        { frequency: 20, power: 0.09 },
        { frequency: 21, power: 0.08 },
        { frequency: 22, power: 0.07 },
        { frequency: 23, power: 0.07 },
        { frequency: 24, power: 0.06 },
        { frequency: 25, power: 0.05 },
        { frequency: 26, power: 0.05 },
        { frequency: 27, power: 0.04 },
        { frequency: 28, power: 0.04 },
        { frequency: 29, power: 0.03 },
        { frequency: 30, power: 0.03 },
        { frequency: 31, power: 0.03 },
        { frequency: 32, power: 0.02 },
        { frequency: 33, power: 0.02 },
        { frequency: 34, power: 0.02 },
        { frequency: 35, power: 0.02 },
        { frequency: 36, power: 0.02 },
        { frequency: 37, power: 0.02 },
        { frequency: 38, power: 0.02 },
        { frequency: 39, power: 0.02 },
        { frequency: 40, power: 0.02 }
      ],
      erpData: [
        { time: -200, voltage: 0.2 },
        { time: -180, voltage: 0.1 },
        { time: -160, voltage: 0.0 },
        { time: -140, voltage: -0.1 },
        { time: -120, voltage: -0.1 },
        { time: -100, voltage: 0.0 },
        { time: -80, voltage: 0.1 },
        { time: -60, voltage: 0.2 },
        { time: -40, voltage: 0.3 },
        { time: -20, voltage: 0.4 },
        { time: 0, voltage: 0.8 },
        { time: 20, voltage: 1.5 },
        { time: 40, voltage: 2.1 },
        { time: 60, voltage: 2.5 },
        { time: 80, voltage: 2.3 },
        { time: 100, voltage: 1.8 },
        { time: 120, voltage: 1.0 },
        { time: 140, voltage: 0.4 },
        { time: 160, voltage: -0.2 },
        { time: 180, voltage: -0.6 },
        { time: 200, voltage: -1.0 },
        { time: 220, voltage: -0.8 },
        { time: 240, voltage: -0.4 },
        { time: 260, voltage: -0.2 },
        { time: 280, voltage: 0.1 },
        { time: 300, voltage: 0.3 },
        { time: 320, voltage: 0.4 },
        { time: 340, voltage: 0.5 },
        { time: 360, voltage: 0.3 },
        { time: 380, voltage: 0.1 },
        { time: 400, voltage: 0.0 },
        { time: 420, voltage: -0.1 },
        { time: 440, voltage: -0.1 },
        { time: 460, voltage: -0.1 },
        { time: 480, voltage: 0.0 },
        { time: 500, voltage: 0.1 }
      ]
    });
  }

  useEffect(() => {
    fetchRecordingData();
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
                <p>{recordingData.mfcc ? recordingData.mfcc.length : 0} coeffs</p>
                <MdOpenInNew
                  className="ml-1 mt-[0.15rem] cursor-pointer text-white hover:text-gray-800 transition-colors"
                  onClick={() => setMfccModalOpen(true)}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-neutral-200/80 flex flex-col gap-2 w-full">
          <div className="flex flex-row justify-between">
            <h3 className="text-2xl font-bold">Data</h3>
            <ButtonGroup className="!shadow-none">
              <Button
                color="alternative"
                className={`transition-all duration-200 ${chartType === "spectrogram" ? "bg-primary hover:bg-primary-light text-white hover:text-black hover:border-none" : ""}`}
                onClick={() => setChartType('spectrogram')}
              >
                <AiOutlineHeatMap className="me-2 h-4 w-4" />
                Spectrogram
              </Button>
              <Button
                color="alternative"
                className={`transition-all duration-200 ${chartType === "periodogram" ? "bg-primary hover:bg-primary-light text-white hover:text-black hover:border-none" : ""}`}
                onClick={() => setChartType('periodogram')}
              >
                <BiPulse className="me-2 h-4 w-4" />
                Periodogram
              </Button>
              <Button
                color="alternative"
                className={`transition-all duration-200 ${chartType === "potentials" ? "bg-primary hover:bg-primary-light text-white hover:text-black hover:border-none" : ""}`}
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
                <Spectrogram data={recordingData.spectrogramData} />
              ) : chartType === 'periodogram' ? (
                <Periodogram data={recordingData.periodogramData} />
              ) : (
                <ERP data={recordingData.erpData} />
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
