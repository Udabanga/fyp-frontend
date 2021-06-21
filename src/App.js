import { useState } from "react";
import { Container, Row, Col, Form, Spinner } from "react-bootstrap";
import AudioRecorder from 'react-audio-recorder';
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";
import { Bar } from 'react-chartjs-2';
import { ReactMic } from 'react-mic';

// import AudioReactRecorder from 'audio-react-recorder'

// import "./App.css";
import "./style.css";
var prediction = {};
var prediction_nr = {};
function App() {
  const [audioPreview, setAudioPreview] = useState(null);
  const [audio, setAudio] = useState(null);
  const [noiseReducedAudio, setNoiseReducedAudio] = useState(null);
  const [spectrogram, setSpectrogram] = useState(null);
  const [noiseReducedSpectrogram, setNoiseReducedSpectrogram] = useState(null);
  const [loading, setLoading] = useState(false);
  const [record, setRecord] = useState(false);

  const [noiseReduction, setNoiseReduction] = useState(false);

  const [recordState, setRecordState] = useState(null);
  // const [prediction, setPrediction] = useState({});

  // const imageToBase64 = require("image-to-base64");

  const onChangeAudio = async (e) => {
    setAudioPreview(URL.createObjectURL(e.target.files[0]));
    setAudio(e.target.files[0]);
    setLoading(true);

    let formData = new FormData();
    formData.append("file", e.target.files[0]);
    formData.append("noiseReduction", noiseReduction)
    //Code to send audio to backend
    sendAudio(formData)
  };

  const sendAudio = async (formData) => {
    console.log(noiseReduction)
    await axios
      .post("http://127.0.0.1:5000/api/uploadRecording", formData)
      .then(function (response) {
        console.log(response);
        setSpectrogram(
          "data:image/jpeg;base64," + response.data.spectrogram_image
        );
        setNoiseReducedSpectrogram(
          "data:image/jpeg;base64," + response.data.spectrogram_image_nr
        );
        setNoiseReducedAudio("data:audio/wav;base64," + response.data.audio_nr);
        // setPrediction(response.data.prediction)
        prediction = JSON.parse(response.data.prediction)
        // prediction_nr = JSON.parse(response.data.prediction_nr)

        setLoading(false);
      })
      .catch(function (error) {
        console.log(error);
        setLoading(false);
      });
  }

  const data = {
    labels: ['angry', 'disgust', 'fear', 'happy', 'neutral', 'sad', 'surprise'],
    datasets: [
      {
        label: 'Emotion Probability',
        data: [prediction.angry, prediction.disgust, prediction.fear, prediction.happy, prediction.neutral, prediction.sad, prediction.surprise],
        backgroundColor: [
          'rgba(255, 99, 132, 0.2)',
          'rgba(255, 159, 64, 0.2)',
          'rgba(255, 205, 86, 0.2)',
          'rgba(75, 192, 192, 0.2)',
          'rgba(54, 162, 235, 0.2)',
          'rgba(153, 102, 255, 0.2)',
          'rgba(201, 203, 207, 0.2)'
        ],
        borderColor: [
          'rgb(255, 99, 132)',
          'rgb(255, 159, 64)',
          'rgb(255, 205, 86)',
          'rgb(75, 192, 192)',
          'rgb(54, 162, 235)',
          'rgb(153, 102, 255)',
          'rgb(201, 203, 207)'
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    scales: {
      yAxes: [
        {
          ticks: {
            beginAtZero: true,
          },
        },
      ],
    },
  };

  const startRecording = () => {
    setRecord(true)
    // setRecordState('start')
  }

  const stopRecording = () => {
    setRecord(false)
    // setRecordState('stop')
  }

  const onData = (recordedBlob) => {
    console.log('chunk of real-time data is: ', recordedBlob);


  }

  const onStop = (recordedBlob) => {
    console.log('recordedBlob is: ', recordedBlob);

    setAudioPreview(recordedBlob.blobURL);
    setAudio(recordedBlob.blob);
    setLoading(true);

    let formData = new FormData();
    formData.append("file", recordedBlob.blob);
    //Code to send audio to backend
    sendAudio(formData)
  }


  return (
    <div className="App">
      <header className="App-header"></header>

      <Container>
        <Row>
          <Col>
            <Form>
              <Form.Group className="Aduio-input-form" controlId="formAudio">
                <Form.Label>Audio File Input:</Form.Label>
                <Row className="Audio-upload-container">
                  <Form.File
                    type="file"
                    accept="audio/wav"
                    onChange={onChangeAudio}
                  />
                  {loading && (
                    <div className="loading">
                      <Spinner as="span" animation="border" role="status" />
                      <strong> Processing</strong>
                    </div>
                  )}
                </Row>
                <Row>
                <Row> </Row>
                <Col>
                <Form.Label>  
                  Noise Reduction:
                </Form.Label>
                </Col>
                <Col >
                  <Form.Check
                    type="radio"
                    label="Enable"
                    name="noiseReduceRadio"
                    id="noiseReduceRadio1"
                    // value={true}
                    onChange={(e) => setNoiseReduction(true)}
                  />
                  <Form.Check
                    type="radio"
                    label="Disable"
                    name="noiseReduceRadio"
                    id="noiseReduceRadio2"
                    // value={false}
                    onChange={(e) => setNoiseReduction(false)}
                    defaultChecked
                  />
                </Col>
                </Row>
              </Form.Group>
            </Form>
          </Col>
          <Col>
            <p>Audio Recording:</p>
            <ReactMic
              record={record}
              className="sound-wave"
              mimeType="audio/wav"
              onStop={onStop}
              onData={onData}
              bufferSize={1024}
              sampleRate={44100}
            // strokeColor="#000000"
            // backgroundColor="#FF4081"
            />
            <button onClick={startRecording} type="button">Start</button>
            <button onClick={stopRecording} type="button">Stop</button>
          </Col>
        </Row>

        <Row>
          <Col className="Audio-output">
            <h3>Input Audio</h3>
            <audio controls src={audioPreview} />
            <img style={{ width: "100%" }} src={spectrogram} />
            {/* <Bar data={data} options={options} hidden={spectrogram == null}/> */}
          </Col>
          <Col className="Audio-output">
            <h3>Noise Reduced Audio</h3>
            <audio controls src={noiseReducedAudio} />
            <img style={{ width: "100%" }} src={noiseReducedSpectrogram} />
            {/* <Bar data={data_nr} options={options} hidden={noiseReducedSpectrogram == null}/> */}
          </Col>
        </Row>
        <Row>
        <Bar data={data} options={options} hidden={spectrogram == null}/>
        </Row>
      </Container>
    </div>
  );
}

export default App;
