// import React, { useState } from 'react';
// import { Link } from 'react-router-dom'
// import './auth.css';

// import {
//   FiMail,
//   FiLock,
//   FiEye,
//   FiEyeOff,
//   FiUser,
// } from 'react-icons/fi';

// import logo from '../../assets/logo.png';

// const SignUp = () => {
//   const [showPassword, setShowPassword] =
//     useState(false);

//   return (
//     <div className="signup-page">

//       <div className="signup-card">

//         <div className="card-logo">
//           <img src={logo} alt="" />
//         </div>

//         <h2>Create Account</h2>

//         <small>
//           Join our global candidate pool
//         </small>

//         <form className="auth-form">

//           <div className="input-group">

//             <FiUser className="input-icon" />

//             <input
//               type="text"
//               placeholder="Full Name"
//             />
//           </div>

//           <div className="input-group">

//             <FiMail className="input-icon" />

//             <input
//               type="email"
//               placeholder="Email Address"
//             />
//           </div>

//           <div className="input-group">

//             <FiLock className="input-icon" />

//             <input
//               type={
//                 showPassword
//                   ? 'text'
//                   : 'password'
//               }
//               placeholder="Password"
//             />

//             <button
//               type="button"
//               className="eye-btn"
//               onClick={() =>
//                 setShowPassword(
//                   !showPassword
//                 )
//               }
//             >
//               {showPassword ? (
//                 <FiEyeOff />
//               ) : (
//                 <FiEye />
//               )}
//             </button>
//           </div>

//           <button className="submit-btn">
//             Create Account
//           </button>
//         </form>
//         <div className="footer-text">
//             Already have an account?

//             <Link to="/signin">
//                 Sign in here
//             </Link>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default SignUp;