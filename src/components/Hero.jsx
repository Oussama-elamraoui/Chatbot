import { React, useState, useCallback, useRef, useEffect, useContext } from "react";
import DownloadAds from "./DownloadAds";
import VisibilitySensor from "react-visibility-sensor";
import { motion } from "framer-motion";
import Webcam from "react-webcam";
import * as tf from '@tensorflow/tfjs';
import * as facemesh from '@tensorflow-models/facemesh';
import { drawMesh } from './utilities';
import App from "./Cam";
import './style.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import DuoIcon from '@mui/icons-material/Duo';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { makeStyles } from '@mui/styles';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { setUser } from './redux/action/auth'
import KeyboardVoiceIcon from '@mui/icons-material/KeyboardVoice';
import WaveSurfer from 'wavesurfer.js';
import SendIcon from '@mui/icons-material/Send';
import OpenAI from "openai";
import { saveAs } from 'file-saver';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import { generateOpenAICompletion } from './openai'

const useStyles = makeStyles((theme) => ({
  select: {
    border: 'none',
    borderColor: 'transparent', // Hide border
    color: 'blue', // Change text color
    '&:focus': {
      backgroundColor: 'transparent', // Hide focus background
    },
    '& .MuiSvgIcon-root': {
      color: '#590087', // Change arrow color
    },
  },
}));
function Hero() {
  const [interventions, setInterventions] = useState([]);
  useEffect(() => {
    const options = {
      method: 'POST',
      url: 'http://192.168.100.157:8016/web/dataset/search_read',
      params: {
        params: {
          model: 'project.task',
          fields: [
            'name',
            // 'project_id',
            // 'societe_mere',
            // 'partner_id',
            // 'user_ids',
            // 'planned_date_begin',
            // 'planned_date_end',
            // 'activity_ids',
            // 'tag_ids',
            // 'bl_number',
            // 'state',
            // 'type_id',
            // 'type_interv',
            // 'code_agency',
            // 'team_id',
            // 'partner_phone',
          ],
          sort: 'name',
          context: {
            lang: 'fr_FR',
            tz: 'Africa/Casablanca',
            uid: 9,
            allowed_company_ids: [1],
            bin_size: true,
          },
        },
      },
    };
    const fetchInterventions = async () => {
      await fetch(options.url, {
        method: options.method,
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json',
          Cookie: 'session_id=83cb1e99a1a4c28c99788b611b1d65690a930194',
        },
        body: JSON.stringify(options.params),
      })
        .then(response => response.json())
        .then(data => {
          // Handle the response data here
          console.log(data);
          setInterventions(data);
        })
        .catch(error => {
          // Handle errors here
          console.error('Error:', error);
          console.log('error');
        });
    };
    fetchInterventions();
  }, []);



  const [dataMessages, setDataMessages] = useState([

  ])
  const wavesurferRef = useRef(null);
  const [speechFile, setSpeechFile] = useState(null);
  const [playing, setPlaying] = useState(true);
  // const dispatch = useDispatch()
  const user = useSelector((state) => state.auth.user);
  const [center, setCenter] = useState([[25.276987, 55.296249]])
  const dataEmotion = useSelector((state) => state.dataEmotion.responseData);
  const classes = useStyles();
  const [count, setCount] = useState([])
  const [helper, setHelper] = useState(0)
  const [wavesurferInstances, setWaveSurferInstances] = useState([]);
  useEffect(() => {
    setWaveSurferInstances([])
    setCount([])
    let i = 0;
    setHelper(0)
    dataMessages.forEach((message, index) => {
      if (message.type == 'audio' && index == dataMessages.length - 1) {
        let temp = 0;
        count.map((item) => {
          if (item[0] == index) {
            temp++;
          }
        })
        if (temp == 0) {
          const waveSurfer = WaveSurfer.create({
            container: `#waveform-${index}`,
            waveColor: '#337ab7',
            progressColor: '#7B00A9',
            cursorWidth: 1,
            cursorColor: '#337ab7',
            barWidth: 2,
            barRadius: 2,
            barHeight: 15,
            width: 65,
            responsive: true,
            height: 25,
          });

          waveSurfer.load(message.content);

          setWaveSurferInstances((wavesurferInstances) => [...wavesurferInstances, waveSurfer])

          setCount(() => [...count, [index, helper]])
          setHelper((h) => h + 1)
        }

      }


    });

  }, [dataMessages]);

  const handleAudio = (index) => {

    count.map((item) => {
      if (item[0] == index) {
        const currentInstance = wavesurferInstances[item[1]];
        // console.log(wavesurferInstances)
        // console.log(currentInstance)
        // console.log(index)
        // console.log(item[0])
        // console.log(item[1])
        if (currentInstance.isPlaying()) {
          currentInstance.pause();
        } else {
          setPlaying(!playing)
          currentInstance.play();
          setPlaying(!playing)
        }
      }
    }

    )

  };
  useEffect(() => {
    const userInfo = localStorage.getItem('user');
    setUser(userInfo)
  }, [])
  const [elementIsVisible, setElementIsVisible] = useState(false);
  // useDispatch();
  const bg = {
    true: {
      left: "7rem",
    },
    false: {
      left: "19rem",
    },
  };
  const musicPlayer = {
    true: {
      left: "295px",
    },
    false: {
      left: "235px",
    },
  };
  const rect = {
    true: {
      left: "11rem",
    },
    false: {
      left: "13rem",
    },
  }
  const heart = {
    true: {
      left: "9rem",
    },
    false: {
      left: "12.5rem",
    },
  };
  const [displayVid, setDisplayVid] = useState(false)
  const [displayMap, setDisplayMap] = useState(false)
  const [locations, seLocations] = useState([])
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  // Load facemesh
  const runFacemesh = async () => {
    const net = await facemesh.load({
      inputResolution: { width: 640, height: 480 },
      scale: 0.8,
    });
    setInterval(() => {
      detect(net);
    }, 50);
  };
  //generate audio

  const openai = new OpenAI({ 'apiKey': API_KEY, dangerouslyAllowBrowser: true });
  const [yourmessage, setYourMessage] = useState(' ')

  const generateSpeech = async (response) => {

    try {
      const mp3 = await openai.audio.speech.create({
        model: "tts-1",
        voice: "alloy",
        input: response,
      });

      const buffer = await mp3.arrayBuffer();
      const blob = new Blob([buffer], { type: 'audio/mp3' });
      console.log(blob)
      // const fileName = 'generated_speech.mp3';  Choose a filename
      // saveAs(blob, fileName);

      setDataMessages((dataMessages) => [...dataMessages, {
        content: URL.createObjectURL(blob), // Store URL instead of blob
        type: 'audio',
        sender: 'gpt'
      }]);

    } catch (error) {
      console.error('Error generating speech:', error);
    }
  };



  // Detect function
  const detect = async (net) => {
    if (
      typeof webcamRef.current !== 'undefined' &&
      webcamRef.current !== null &&
      webcamRef.current.video.readyState === 4
    ) {
      // Get video properties
      const video = webcamRef.current.video;
      const videoWidth = webcamRef.current.video.videoWidth;
      const videoHeight = webcamRef.current.video.videoHeight;
      // Set video height and width
      webcamRef.current.video.width = videoWidth;
      webcamRef.current.video.height = videoHeight;
      // Set canvas height and width
      canvasRef.current.width = videoWidth;
      canvasRef.current.height = videoHeight;
      // Make detection
      const face = await net.estimateFaces(video);
      // Get canvas context for drawing
      const ctx = canvasRef.current.getContext('2d');
      drawMesh(face, ctx);
    }
  };
  runFacemesh();
  const [typeOp, setTypeOp] = useState('Text');

  const handleChange = (event) => {
    setTypeOp(event.target.value);
  };
  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      const promptMessage = yourmessage
      setYourMessage('');
      event.preventDefault(); // Prevent default behavior of form submission
      sendMessage(promptMessage);
    }
  };

  const sendMessage = async (promptMessage) => {
    // console.log('heeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeey')
    console.log(dataEmotion)
    setDataMessages((dataMessages) => [...dataMessages, {
      content: promptMessage,
      type: 'text',
      sender: 'you'
    }])

    const jsonString = JSON.stringify(dataEmotion);
    let promptwithEmotion = `You are as  a social assistant and a friend talking to this person,Please just answer the question without adding anything,this is his information and  analysis appear as that: analysis={${jsonString}} using computer vision. when  he ask you to suggest  some places to visit , it must the response looks like (global description of places and in the end Locations={"location1Name":{"lat":48.8529,"long":2.3499}, "locaction2Name":{"lat":48.8529,"long":2.3499}}) because  i want to take description and location to  display them on the map, please don't suggest any place if until he demand to you to suggest. He said: ${promptMessage}`
    console.log(promptwithEmotion)
    const response = await generateOpenAICompletion(promptwithEmotion)
    console.log(response)
    const Newresponse = response.split('Locations')[0]

  
    if (response.split('Locations=')[1]) {
    const dataloca=response.split('Locations=')[1]
    console.log(dataloca)
    console.log('json')
    console.log(JSON.parse(dataloca))
    for (const placeName in JSON.parse(dataloca)) {
      if (JSON.parse(dataloca).hasOwnProperty(placeName)) {
        const { lat, long } = JSON.parse(dataloca)[placeName];
        seLocations((dt)=>[...dt,{ placeName, latitude: lat, longitude: long }])
        locations.push({ placeName, latitude: lat, longitude: long });
        setDisplayMap(false)
        setCenter((cen)=>[...cen,[lat, long]])
      }
    }
    

      console.log(locations);
      if (locations.length > 0) {
        // console.log(center)
        setDisplayMap(true)
        // console.log(displayMap)
      }
      console.log(locations)
    }

    if (typeOp == 'Audio') {
      generateSpeech(Newresponse)
    }
    else {

      setDataMessages((dataMessages) => [...dataMessages, {
        content: Newresponse,
        type: 'text',
        sender: 'gpt'
      }])
    }

  }
  return (
    <VisibilitySensor
      onChange={(isVisible) => setElementIsVisible(isVisible)}
      minTopValue={300}
    >
      <div className="wrapper bg-[#081730] flex items-center justify-between px-[5rem] rounded-b-[5rem] w-[100%] h-[35rem] relative z-[3]">
        {/* left side */}
        <div className="headings flex flex-col items-start justify-center h-[100%] text-[3rem]">

          {user ?
            <div class="flex flex-col h-full  mb-4  mt-6 border  scale-up-hor-center " style={{ borderWidth: '0.5px', borderRadius: '20px', width: '488px', height: '490px' }}>
              <div class=" bg-red d-flex  justify-content-end head-chat" style={{ height: '60px', width: '100%', borderTopRightRadius: '20px', borderTopLeftRadius: '20px' }}>
                <div class="col-lg-6 d-flex align-items-center">
                  <img src={require("../img/Chatbot.png")} alt="" style={{ width: '40px', marginLeft: '10px' }} />
                  <div class="py-auto px-auto ml-2 " style={{ marginLeft: '5px', marginTop: '10px' }}>

                    <h6 class="m-b-0" style={{ fontSize: '0.9rem' }}>Chat</h6>
                  </div>
                </div>
                <div class="col-lg-6 hidden-sm text-right d-flex justify-content-end align-items-center">

                  <DuoIcon style={{ marginRight: '10px', cursor: 'pointer' }} onClick={() => setDisplayVid(!displayVid)} />

                  {/* <p style={{ fontSize: '1rem' }}>Response</p> */}
                  <Select
                    labelId="demo-simple-select-autowidth-label"
                    id="demo-simple-select-autowidth"
                    value={typeOp}
                    onChange={handleChange}
                    autoWidth
                    label="Age"
                    style={{ height: '30px', marginTop: '0px', width: '80px', color: '#590087', fontSize: '0.7', border: 'none' }}

                    defaultValue="Text"
                    className={classes.select}
                  >
                    <MenuItem value={'Text'} selected>Text</MenuItem>
                    <MenuItem value={'Audio'}>Audio</MenuItem>
                  </Select>

                </div>
              </div>
              {/* <hr class="hr" /> */}
              <div class="flex flex-col h-full ">
                <div class="grid grid-cols-12 gap-y-2">
                  <div class="col-start-1 col-end-8 p-3 rounded-lg overflow-auto custom-scrollbar" style={{ height: '389px', width: '485px', }}>
                    {dataMessages.map((item, index) => {
                      return (
                        <div class="flex flex-row items-center mb-4">
                          {item.sender == 'you' ?
                            <div
                              class="flex items-center justify-center h-10 w-10 rounded-full bg-indigo-500 flex-shrink-0" style={{ fontSize: '0.9rem' }}>
                              You
                            </div> :
                            <div class="flex items-center justify-center h-10 w-10 rounded-full bg-indigo-500 flex-shrink-0" style={{ fontSize: '0.9rem' }}>
                              Ai
                            </div>

                          }
                          <div
                            class="relative ml-3 text-sm bg-none py-2 px-4 shadow rounded-xl bg-[#071F44] "
                            style={{ boxShadow: 'rgb(1,64,106) 0px 50px 100px -20px, rgba(0, 0, 0, 0.3) 0px 30px 60px -30px', borderImage: 'radial-gradient(at left bottom, #5D0494, #0790B3)' }}
                          >

                            {item.type == 'text' ? <div className="background-black" style={{ textAlign: 'justify', whiteSpace: 'pre-line' }}>{item.content}</div> :
                              <div style={{ height: '30px' }} className="d-flex justify-content-center row">
                                {/* <button >{playing ? 'Pause' : 'Play'}</button> */}
                                <div className="col-3 cursor-pointer" key={index}>
                                  {playing ? <PlayArrowIcon onClick={() => handleAudio(index)} /> :
                                    <PauseIcon onClick={() => handleAudio(index)} />}
                                </div>
                                <div className="col-8" key={index}>
                                  {/* <button onClick={() => WaveSurfer.playPause()}>Play/Pause</button> */}
                                  <div id={`waveform-${index}`} />
                                </div>
                              </div>
                              // <div className="background-black"><div id={`waveform-${index}`}></div>

                            }

                          </div>
                        </div>
                      )

                    })}

                    {/* audio */}

                  </div>

                </div>
                <div style={{
                  position: 'absolute',
                  bottom: '0px',
                  borderBottomRightRadius: '20px',
                  borderBottomLeftRadius: '20px',
                  width: '485px',
                  marginLeft: '0.1px',
                  paddingTop: '0px'
                }} className="row bg-[#05183E] pt-0" >
                  <div className="col-10 mt-0 ">
                    <input className="border-none color-white mt-0 bg-[#477CE7]" placeholder="Type..." style={{
                      width: '90%',
                      height: '40px',
                      fontSize: '0.999rem',
                      outline: 'none',
                      marginTop: '0px',
                      background: 'transparent' // Set background to transparent
                    }}
                      onKeyPress={(e) => handleKeyPress(e)}
                      value={yourmessage}
                      onChange={(e) => setYourMessage(e.target.value)}
                    ></input>
                  </div>
                  <div className="col-1 cursor-pointer">
                    <SendIcon style={{ color: 'radial-gradient(at left bottom, #5D0494, #0790B3)' }} onClick={sendMessage} />
                  </div>
                </div>
              </div>
            </div> :
            <>
              <div className="title">Welcome!</div>
              <div className="title gradient-bg">
                Enjoy Chat with AI
              </div>
            </>
          }
          {/* Cam */}
          {displayVid &&
            <div className="container position-absolute scale-up-hor-center" style={{ position: 'absolute', right: '30px', top: '200px', backgroundColor: 'red' }}>
              <div style={{ borderRadius: '20px', backgroundColor: 'red' }}>
                <App />
              </div>
            </div>}
          {displayMap &&
            <div style={{ position: 'absolute', right: '50px', borderRadius: '20px', with: '600px', zIndex: '100', padding: '10px', }} className='head-chat'>
              <div className="map" id='map' >
                <MapContainer center={center[center.length - 1]} zoom={13} scrollWheelZoom={true}>
                  {/* <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" attribution="Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS," /> */}
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  {locations.map((location, index) => (
                    <Marker position={[location.latitude, location.longitude]} key={index}>
                      <Popup>{location.placeName}</Popup>
                    </Marker>
                  ))}
                </MapContainer>

              </div >
            </div>
          }

          <div />
        </div>
        {/* right side */}
        <div className="images relative w-[50%]">
          <motion.img
            variants={bg}
            animate={`${elementIsVisible}`}
            transition={{ duration: 1, type: "ease-out " }}
            src={require("../img/backgraphics.png")}
            alt=""
            className="absolute top-[-8rem] left-[19rem]"
          />
          <img
            src={require("../img/p 1.png")}
            alt=""
            className="absolute top-[-15rem] h-[34rem] left-[13rem]"
          />
          <motion.img
            variants={musicPlayer}
            animate={`${elementIsVisible}`}
            transition={{
              duration: 1,
              type: "ease-out",
            }}
            src={require("../img/p 2.png")}
            alt=""
            className="absolute left-[235px] top-[94px] w-[175px]"
          />
          <motion.img
            variants={rect}
            animate={`${elementIsVisible}`}
            transition={{
              type: "ease-out",
              duration: 1,
            }}
            src={require("../img/p 3.png")}
            alt=""
            className="absolute w-[5rem] left-[13rem] top-[12rem]"
          />
          <motion.img
            variants={heart}
            animate={`${elementIsVisible}`}
            transition={{
              type: "ease-out",
              duration: 1,
            }}
            src={require("../img/p 4.png")}
            alt=""
            className="absolute w-[5rem] left-[12.5rem] top-[12rem]"
          />
        </div>
      </div>
    </VisibilitySensor >
  );
}

export default Hero;
