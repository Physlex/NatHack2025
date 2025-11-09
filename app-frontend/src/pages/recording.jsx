import { Button, Modal, ModalBody, ModalFooter, ModalHeader, ButtonGroup } from "flowbite-react"
import { FaArrowLeft } from "react-icons/fa6";
import { useParams } from 'react-router-dom';
import { useEffect, useState } from "react";
import { FaWaveSquare } from "react-icons/fa6";
import { MdOpenInNew } from "react-icons/md";
import { AiOutlineHeatMap } from "react-icons/ai";
import { BiPulse } from "react-icons/bi";
import { GiBrain } from "react-icons/gi";
import { formatDate } from "../lib/utils";

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
      mfcc: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
    });
  }

  useEffect(() => {
    fetchRecordingData();
  }, [id]);

  return (
    <div className="bg-offwhite w-screen min-h-lvh flex flex-col px-8 py-12">
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

          <div className="bg-primary-light col-span-3 row-span-1 p-6 rounded-xl flex flex-col gap-4 relative overflow-hidden">
            <img
              src="/assets/images/background-lines-white-2.png"
              alt="Background Lines"
              className="absolute inset-0 w-full h-full object-cover opacity-50 pointer-events-none z-0"
            />
            <div className="bg-secondary w-min p-3 rounded-lg items-center flex flex-col justify-center relative z-10">
              <FaWaveSquare className="text-4xl text-primary" />
            </div>
            <div className="relative z-10">
              <h3 className="text-2xl font-bold">MFCC Features</h3>
              <div className="flex flex-row items-center">
                <p>{recordingData.mfcc ? recordingData.mfcc.length : 0} coeffs</p>
                <MdOpenInNew
                  className="ml-1 cursor-pointer text-gray-600 hover:text-gray-800 transition-colors"
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
                className={`transition-all duration-200 ${chartType === "spectrogram" ? "bg-primary-light hover:bg-primary hover:text-white" : ""}`}
                onClick={() => setChartType('spectrogram')}
              >
                <AiOutlineHeatMap className="me-2 h-4 w-4" />
                Spectrogram
              </Button>
              <Button
                color="alternative"
                className={`transition-all duration-200 ${chartType === "periodogram" ? "bg-primary-light hover:bg-primary hover:text-white" : ""}`}
                onClick={() => setChartType('periodogram')}
              >
                <BiPulse className="me-2 h-4 w-4" />
                Periodogram
              </Button>
              <Button
                color="alternative"
                className={`transition-all duration-200 ${chartType === "potentials" ? "bg-primary-light hover:bg-primary hover:text-white" : ""}`}
                onClick={() => setChartType('potentials')}
              >
                <GiBrain className="me-2 h-4 w-4" />
                Event-Related Potentials
              </Button>
            </ButtonGroup>
          </div>
          <div className="w-full h-full bg-neutral-50 rounded flex items-center justify-center">
            <span className="text-gray-400">Spectrogram</span>
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
