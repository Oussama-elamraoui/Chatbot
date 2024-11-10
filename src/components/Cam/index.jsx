/* eslint-disable no-unused-vars */
import './index.css';
import React, { useRef, useState, useContext, createContext,useEffect} from 'react';
import * as tf from '@tensorflow/tfjs';
import * as facemesh from '@tensorflow-models/facemesh';
import Webcam from 'react-webcam';
import { drawMesh } from './utilities';
import { connect } from 'react-redux';
import { setResponse } from '../redux/action/responseActions';
import { useDispatch } from 'react-redux';
import CameraIcon from '@mui/icons-material/Camera';
function App() {
	// Set up references
	const webcamRef = useRef(null);
	const canvasRef = useRef(null);
	const Emotiondata = createContext()
	const dispatch = useDispatch()
	const [dataemotion, setUdataEmotion] = useState()
	// Load facemesh
	const runFacemesh = async () => {
		const net = await facemesh.load({
			inputResolution: { width: 640, height: 400 },
			scale: 0.8,
		});
		setInterval(() => {
			detect(net);
		}, 100);
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
	// useEffect(() => {
	// 	// const interval = setInterval(() => {
	// 	//   // Your function to run every 8 seconds goes here
		  
	// 	// }, 12000);
	// 	capture()
	// 	// Clean up the interval on component unmount
	// 	// return () => clearInterval(interval);
	//   }, []);
	runFacemesh();
	const state = {
		// Initially, no file is selected
		selectedFile: null,
	};
	const [myfile, setFile] = useState()
	const onFileChange = (event) => {
		// Update the state
		// setFile(event.target.files[0])
		capture()

	};
	const capture = async () => {
		const imageSrc = webcamRef.current.getScreenshot();
		const canvas = canvasRef.current;
		const ctx = canvas.getContext('2d');
		const img = new Image();
		img.src = imageSrc;
		img.onload = () => {
			canvas.width = img.width;
			canvas.height = img.height;
			ctx.drawImage(img, 0, 0);
			canvas.toBlob(async (blob) => {
				const file = new File([blob], 'image.jpg', { type: 'image/jpeg' });
				// console.log(file)

				// Send the file to your API for analysis
				const formData = new FormData();
				formData.append('image', file);

				try {
					const response = await fetch('http://127.0.0.1:8000/api/analyze_image/', {
						method: 'POST',
						headers: {
							'Authorization': `Token ${'f8bad44ae55b5ff6e4666a9e2cda149ebd67dd15'}`
						},
						body: formData,
					});
					const data = await response.json();
					dispatch(setResponse(data))
					 // Dispatch the response to Redux
					console.log(data); // Handle the response from the API
				} catch (error) {
					console.error('Error uploading file:', error);
				}
			}, 'image/jpeg');
		};
	}
	const senData = async () => {
		const formData = new FormData();
		formData.append('image', myfile);
		try {
			const response = await fetch('http://127.0.0.1:8000/api/analyze_image/', {
				method: 'POST',
				headers: {
					'Authorization': `Token ${'f8bad44ae55b5ff6e4666a9e2cda149ebd67dd15'}`
				},
				body: formData,
			});
			const data = await response.json();
			console.log(data); // Handle the response from the API
		} catch (error) {
			console.error('Error uploading file:', error);
		}
	}

	return (
		<Emotiondata.Provider value={dataemotion}>
			<div className='App' style={{ backgroundColor: 'red' }}>
				<header className='App-header' style={{ backgroundColor: 'red' }}>
					<Webcam
						ref={webcamRef}
						style={{
							position: 'absolute',
							marginLeft: 'auto',
							marginRight: 'auto',
							left: 0,
							right: 0,
							textAlign: 'center',
							zIndex: 9,
							width: '250px',
							height: '250px',
							borderRadius: '20px',
							background: 'radial-gradient(at left bottom, #5D0494, #0790B3)'
						}}
					/>
					<canvas
						ref={canvasRef}
						style={{
							position: 'absolute',
							marginLeft: 'auto',
							marginRight: 'auto',
							left: 0,
							right: 0,
							textAlign: 'center',
							zIndex: 9,
							width: '250px',
							height: '250px',

						}}
					/>
					{/* <input type='file' onChange={onFileChange} style={{ width: '40px', position: 'absolute', zIndex: '100' }}></input>*/}
					<button onClick={capture} style={{ width: '20px', position: 'absolute', zIndex: '100',top:'-100px',right:'460px' }}><CameraIcon></CameraIcon></button> 
				</header>
               
			</div>
		</Emotiondata.Provider>
	);
}

export default App;
