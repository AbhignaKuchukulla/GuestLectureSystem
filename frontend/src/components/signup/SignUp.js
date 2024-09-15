import React from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import "./SignUp.css";

function SignUp() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [err, setErr] = useState("");
  const [state, setState] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const navigate = useNavigate();

  async function onSignUpFormSubmit(userObj) {
    try {
      let res;
      if (userObj.userType === 'faculty') {
        res = await axios.post("http://localhost:4000/faculty-api/register", userObj);
      } else if (userObj.userType === 'admin') {
        res = await axios.post("http://localhost:4000/admin-api/register", userObj);
      } else {
        res = await axios.post("http://localhost:4000/hod-api/register", userObj);
      }

      if (res && res.data.message === `${userObj.userType.charAt(0).toUpperCase() + userObj.userType.slice(1)} created`) {
        setState(true);
        setSignupSuccess(true);
        setErr("");
        navigate('/login');
      } else if (res) {
        setErr(res.data.message);
      } else {
        setErr("Unexpected error occurred");
      }
    } catch (error) {
      setErr(error.response?.data?.message || "An error occurred");
    }
  }

  return (
    <div className="container">
      <div className="card">
        <div className="card-title">
          {signupSuccess ? (
            <div>
              <p className="lead text-success">
                User registration success
              </p>
              <p className="text-secondary">
                Proceed to <Link to="/login">Login</Link>
              </p>
              <p className="text-secondary">
                Back to <Link to="/">Home</Link>
              </p>
            </div>
          ) : (
            <h2>Signup</h2>
          )}
        </div>
        <div className="card-body">
          {err && <p className="text-danger">{err}</p>}

          <form onSubmit={handleSubmit(onSignUpFormSubmit)}>
            <div className="form-group">
              <label htmlFor="userType">Register as</label>
              <div className="radio-group">
                <label>
                  <input
                    type="radio"
                    value="faculty"
                    {...register("userType", { required: true, disabled: state })}
                  />
                  Faculty
                </label>
                <label>
                  <input
                    type="radio"
                    value="admin"
                    {...register("userType", { required: true, disabled: state })}
                  />
                  Admin
                </label>
                <label>
                  <input
                    type="radio"
                    value="hod"
                    {...register("userType", { required: true, disabled: state })}
                  />
                  HOD
                </label>
              </div>
              {errors.userType?.type === "required" && (
                <p className="text-danger">Please select a User type</p>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                {...register("username", { 
                  required: true,
                  minLength: 4,
                  maxLength: 10,
                  disabled: state 
                })}
              />
              {errors.username?.type === "required" && (
                <p className="text-danger">Username is required</p>
              )}
              {errors.username?.type === "minLength" && (
                <p className="text-danger">Min length should be 4</p>
              )}
              {errors.username?.type === "maxLength" && (
                <p className="text-danger">Max length should be 10</p>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                {...register("password", { 
                  required: true,
                  pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/,
                  disabled: state 
                })}
              />
              {errors.password?.type === "required" && (
                <p className="text-danger">Password is required</p>
              )}
              {errors.password?.type === "pattern" && (
                <p className="text-danger">
                  Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number
                </p>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                {...register("email", { 
                  required: true,
                  pattern: /^[^@\s]+@[^@\s]+\.[^@\s]+$/,
                  disabled: state 
                })}
              />
              {errors.email?.type === "required" && (
                <p className="text-danger">Email is required</p>
              )}
              {errors.email?.type === "pattern" && (
                <p className="text-danger">Email is not valid</p>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="id">ID</label>
              <input
                type="text"
                id="id"
                {...register("id", { 
                  required: true,
                  disabled: state 
                })}
              />
              {errors.id?.type === "required" && (
                <p className="text-danger">ID is required</p>
              )}
            </div>

            <button type="submit" className="btn">Signup</button>

            <p className="text-center text-muted">
              Have an account?{" "}
              <Link to="/login">Login</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default SignUp;
