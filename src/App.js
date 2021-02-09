import { useState } from "react";
import { Container, Row, Col, Form, Spinner } from "react-bootstrap";
import ReactAudioPlayer from "react-audio-player";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";
// import audiofile from "./Haunting_song_of_humpback_whales-youtube-W5Trznre92c.wav"

// import "./App.css";
import "./style.css";

function App() {
  const [audioPreview, setAudioPreview] = useState(null);
  const [audio, setAudio] = useState(null);
  const [noiseReducedAudio, setNoiseReducedAudio] = useState(null);
  const [spectrogram, setSpectrogram] = useState(null);
  const [noiseReducedSpectrogram, setNoiseReducedSpectrogram] = useState(null);
  const [loading, setLoading] = useState(false);

  const imageToBase64 = require("image-to-base64");

  const onChangeAudio = async (e) => {
    setAudioPreview(URL.createObjectURL(e.target.files[0]));
    setAudio(e.target.files[0]);
    setLoading(true);
    let formData = new FormData();
    formData.append("file", e.target.files[0]);
    //Code to send audio to backend
    await axios
      .post("http://127.0.0.1:8000/api/uploadRecording", formData)
      .then(function (response) {
        console.log(response);
        setSpectrogram(
          "data:image/jpeg;base64," + response.data.spectrogram_image
        );
        setNoiseReducedSpectrogram(
          "data:image/jpeg;base64," + response.data.nr_spectrogram_image
        );
        setNoiseReducedAudio("data:audio/wav;base64," + response.data.nr_audio);
        console.log(response.data.nr_audio);
        setLoading(false);
      })
      .catch(function (error) {
        console.log(error);
        setLoading(false);
      });
  };

  return (
    <div className="App">
      <header className="App-header"></header>

      <Container>
        <Form>
          <Form.Group className="Aduio-input-form" controlId="formAudio">
            <Form.Label>Audio Recording:</Form.Label>
            <div className="Audio-upload-container">
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
            </div>
          </Form.Group>
        </Form>
        <Row>
          <Col className="Audio-output">
            <h3>Input Audio</h3>
            <audio controls src={audioPreview} />
            <img style={{ width: "100%" }} src={spectrogram} />
          </Col>
          <Col className="Audio-output">
            <h3>Noise Reduced Audio</h3>
            <audio controls src={noiseReducedAudio} />
            <img style={{ width: "100%" }} src={noiseReducedSpectrogram} />
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default App;
