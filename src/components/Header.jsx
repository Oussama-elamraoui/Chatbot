import React, { useEffect, useState } from "react";
import CenterMenu from "./CenterMenu";
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import 'bootstrap/dist/css/bootstrap.min.css';
import './style.css'
import { useDispatch } from 'react-redux';
import { setUser } from './redux/action/auth'
import Modal from 'react-bootstrap/Modal';
import { useSelector } from 'react-redux';
import braiAi from '../img/image-removebg-preview (5).png'

function Header() {



  
  const buttonStyle =
    "border-[2px] rounded-[10px] border-[#232A4E] px-[25px] py-[7px]";
  const USER = useSelector((state) => state.auth.user);
  const [showDropdown, setShowDropdown] = useState(false);
  const [lgShow, setLgShow] = useState(false);
  const [typeOp, settypeOp] = useState('login')
  const handleDropdownToggle = () => {
    setShowDropdown(!showDropdown);
  };
  const dispatch = useDispatch()
  const User = useSelector((state) => state.auth.user);
  const [user, setuser] = useState()
  const saveData = () => {
    if (typeOp =='register') {
      if (full_name && email && password) {
        fetch('http://127.0.0.1:8000/api/register/',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              "full_name": full_name,
              "email": email,
              "password": password
            })
          }
        ).then(response => response.json())
          .then(data => dispatch(setUser(data)))
          .catch(e => console.log(e))
      }
      else {
        alert('Please! Try again')
      }

    }
    else {
      console.log('I am in login')
      fetch('http://127.0.0.1:8000/api/login/',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            "email": email,
            "password": password
          })
        }
      ).then(response => response.json())
        .then(data => setuser(data))
        .catch(e => console.log(e))
        setLgShow(false)
        dispatch(setUser(user))
    }
    
  }
  const [email, setEmail] = useState("")
  const [full_name, setFull_name] = useState("")
  const [password, setPassword] = useState("")

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', user);
      setUser(user);
    }
  }, [user])
  return (
    <>
      <div className="header bg-[#081730] flex items-center justify-between px-[5rem] pt-[2.4rem] text-[0.8rem]">
        {/* logo */}
        <img
          src={braiAi}
          alt=""
          className="logo  w-[42px] h-[42px]"
        />
        {/* side menu */}
        <CenterMenu />
        {/* buttons */}
        {/* <div className="buttons flex">
        <button className={`mr-[35px] hover:bg-[#232A4E] ` + buttonStyle}>
          Log in
        </button>
        <button className={buttonStyle + ` bg-[#232A4E]`}>Sign up</button>
      </div> */}
        <div className="bg-red d-flex justify-content-end">
          <div
            className="profile-image"
            onClick={handleDropdownToggle}
            aria-controls="basic-nav-dropdown"
            style={{ right: '0px' }}
          >
            <img
              src="https://icon-library.com/images/no-user-image-icon/no-user-image-icon-0.jpg"
              alt="User Profile"
              style={{ width: '30px', height: '30px', borderRadius: '50%', marginRight: '10px' }}
            />
          </div>
          <NavDropdown
            id="basic-nav-dropdown"
            show={showDropdown}
            alignRight
            title=""
            onHide={() => setShowDropdown(false)}
            style={{ width: '2px', top: '40px' }}
            className="custom-dropdown"
          >
            {!User ? <NavDropdown.Item onClick={() => setLgShow(true)} >Login/Register</NavDropdown.Item> :
              <>
                <NavDropdown.Item >Profile</NavDropdown.Item>
                {/* <NavDropdown.Item >Settings</NavDropdown.Item> */}
                <NavDropdown.Divider />
                <NavDropdown.Item >Logout</NavDropdown.Item>
              </>
            }

          </NavDropdown>
        </div>
      </div>
      <Modal size="lg" show={lgShow}
        onHide={() => setLgShow(false)} aria-labelledby="example-modal-sizes-title-lg">

        {/* <Modal.Title id="example-modal-sizes-title-lg">Large Modal</Modal.Title> */}

        <Modal.Body style={{ backgroundColor: 'black', height: '600px' }}>
          <section>
            <div className="background-animation">
              {[...Array(60)].map((_, index) => (
                <span key={index}></span>
              ))}
            </div>

            <div className="signin">
              <div className="content">
                {typeOp == 'register' && <h2>SignUp</h2>}
                {typeOp == 'login' && <h2>signIn</h2>}
                <div className="form">
                  <div className="inputBox">
                    <input type="text" required onChange={(e) => setEmail(e.target.value)} />
                    <i>Email</i>
                  </div>
                  {typeOp == 'register' &&
                    <div className="inputBox">
                      <input type="text" required onChange={(e) => setFull_name(e.target.value)} />
                      <i>Username</i>
                    </div>}
                  <div className="inputBox" >
                    <input type="password" required onChange={(e) => setPassword(e.target.value)} />
                    <i>Password</i>
                  </div>
                  <div className="links">
                    <a href="#">Forgot Password</a>

                    {typeOp == 'login' && <a href="#" onClick={() => settypeOp('register')}>Signup</a>}
                    {typeOp == 'register' && <a href="#" onClick={() => settypeOp('login')} >Sign in</a>}
                  </div>
                  <div className="inputBox">
                    <input type="submit" value="Login" onClick={saveData} />
                  </div>
                </div>
              </div>
            </div>
          </section>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default Header;
