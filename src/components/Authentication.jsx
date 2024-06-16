import { useContext, useState, createContext } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { FileUpload } from "primereact/fileupload";
// import { Button } from "primereact/button";
import "primereact/resources/themes/saga-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { auth, db, storage } from "../firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { Button } from "primereact/button";
import { AuthContext } from "../context/AuthContext";
const SignUpForm = () => {
  const [imagePreview, setImagePreview] = useState(null);
  const [imageError, setImageError] = useState(null);
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(false);
  const signUp = useContext(SignUpContextProvider);
  const user = useContext(AuthContext);
  const navigate = useNavigate();
  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
      username: "",
      image: null,
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email("Invalid email address")
        .required("Email is required"),
      password: Yup.string()
        .min(8, "Password must be at least 8 characters")
        .matches(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/,
          "Password must contain at least one uppercase letter, one lowercase letter, and one number"
        )
        .max(20, "Password must be at most 20 characters long")
        .required("Password is required"),
      username: Yup.string()
        .required("Username is required")
        .max(12, "username must be at most 12 characters long"),
      image: Yup.mixed().required("Profile image is required"),
    }),
    onSubmit: async (values) => {
      setLoading(true);
      setErr(null);
      try {
        const res = await createUserWithEmailAndPassword(
          auth,
          values.email,
          values.password
        );

        const uploadTask = uploadBytesResumable(
          ref(storage, values.username),
          values.image
        );

        uploadTask.on(
          (error) => {
            setErr(error.message);
            setLoading(false);
          },
          async () => {
            try {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

              await updateProfile(res.user, {
                displayName: values.username,
                photoURL: downloadURL,
              });

              await setDoc(doc(db, "users", res.user.uid), {
                uid: res.user.uid,
                username: values.username,
                email: values.email,
                photoURL: downloadURL,
              });

              await setDoc(doc(db, "userMessages", res.user.uid), {});
              navigate("/");
              setLoading(false);
            } catch (err) {
              setErr(err.message);
              setLoading(false);
            }
          }
        );
      } catch (err) {
        setErr(err.message);
        setLoading(false);
      }
    },
  });

  const handleImageUpload = (event) => {
    const file = event.files[0];
    setImageError(null);

    if (file) {
      const fileType = file.type;
      const validImageTypes = ["image/jpeg", "image/png", "image/gif"];
      if (!validImageTypes.includes(fileType)) {
        setImageError("Only JPEG, PNG, and GIF files are allowed");
        return;
      }

      if (file.size > 500 * 1024) {
        setImageError("File size must be less than 500KB");
        formik.setFieldError("image", "File size must be less than 500KB");
        return;
      }

      formik.setFieldValue("image", file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-transparent">
      <div className="bg-[#424769] content p-6 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-[#7077A1] text-center mb-4">
          Sign Up
        </h2>
        <form onSubmit={formik.handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block mb-2 text-[#7077A1]">
              Email
            </label>
            <InputText
              id="email"
              name="email"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={`w-full bg-[#7077A1] text-[#2d3250] p-2 p-inputtext-sm ${
                formik.touched.email && formik.errors.email ? "p-invalid" : ""
              }`}
              style={{ boxShadow: "none" }}
            />
            {formik.touched.email && formik.errors.email && (
              <small className="p-error">{formik.errors.email}</small>
            )}
          </div>
          <div className="mb-4">
            <label htmlFor="password" className="block mb-2 text-[#7077A1]">
              Password
            </label>
            <Password
              id="password"
              name="password"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              feedback={false}
              className={`w-full p-inputtext-sm ${
                formik.touched.password && formik.errors.password
                  ? "p-invalid"
                  : ""
              }`}
            />
            {formik.touched.password && formik.errors.password && (
              <small className="p-error">{formik.errors.password}</small>
            )}
          </div>
          <div className="mb-4">
            <label htmlFor="username" className="block mb-2 text-[#7077A1]">
              Username
            </label>
            <InputText
              id="username"
              name="username"
              value={formik.values.username}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={`w-full bg-[#7077A1] text-[#2d3250] p-2 p-inputtext-sm ${
                formik.touched.username && formik.errors.username
                  ? "p-invalid"
                  : ""
              }`}
              style={{ boxShadow: "none" }}
            />
            {formik.touched.username && formik.errors.username && (
              <small className="p-error">{formik.errors.username}</small>
            )}
          </div>
          <div className="mb-4">
            <label htmlFor="image" className="block mb-2 text-[#7077A1]">
              Profile Image
            </label>
            <FileUpload
              id="image"
              mode="basic"
              customUpload
              uploadHandler={handleImageUpload}
              auto
              chooseLabel="Upload"
              className="w-full"
              accept="image/*"
            />
            {formik.errors.image && formik.touched.image && (
              <small className="p-error">{formik.errors.image}</small>
            )}
            {imageError && <small className="p-error">{imageError}</small>}
            {imagePreview && (
              <div className="mt-4">
                <img
                  src={imagePreview}
                  alt="Image Preview"
                  className="w-[auto] h-[100px] rounded-lg object-cover mx-auto"
                />
              </div>
            )}
          </div>

          {err && <p className="error-text">{err}</p>}
          {user && <p className="redireact-text">Redireacting...</p>}
          <div className="w-full flex justify-center">
            <Button
              type="submit"
              label="Sign Up"
              loading={loading}
              className="sign_up_btn p-mt-2"
            />
          </div>
        </form>
        <div className="mt-4 text-center">
          <p className="text-[#7077A1]">
            Already have an account?{" "}
            <button
              onClick={() => signUp.setState(!signUp.state)}
              className="text-[#8b93c2]"
            >
              Switch to Login
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
const LoginForm = () => {
  const [loading, setLoading] = useState(false);
  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email("Invalid email address")
        .required("Email is required"),
      password: Yup.string()
        .min(8, "Password must be at least 8 characters")
        .matches(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/,
          "Password must contain at least one uppercase letter, one lowercase letter, and one number"
        )
        .required("Password is required"),
    }),
    onSubmit: async (values) => {
      setLoading(true);
      try {
        const res = await signInWithEmailAndPassword(
          auth,
          values.email,
          values.password
        );
        setLoading(false);
      } catch (err) {
        setErr(err.message);
        setLoading(false);
      }
    },
  });

  const signUp = useContext(SignUpContextProvider);
  const [err, setErr] = useState(null);

  return (
    <div className="flex justify-center items-center h-screen bg-transparent">
      <div className="bg-[#424769] content p-6 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-[#7077A1] text-center mb-4">
          Login
        </h2>
        <form onSubmit={formik.handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block mb-2 text-[#7077A1]">
              Email
            </label>
            <InputText
              id="email"
              name="email"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={`w-full bg-[#7077A1] text-[#2d3250] p-2 p-inputtext-sm ${
                formik.touched.email && formik.errors.email ? "p-invalid" : ""
              }`}
              style={{ boxShadow: "none" }}
            />
            {formik.touched.email && formik.errors.email && (
              <small className="p-error">{formik.errors.email}</small>
            )}
          </div>
          <div className="mb-4">
            <label htmlFor="password" className="block mb-2 text-[#7077A1]">
              Password
            </label>
            <Password
              id="password"
              name="password"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              feedback={false}
              className={`w-full mb-2 p-inputtext-sm ${
                formik.touched.password && formik.errors.password
                  ? "p-invalid"
                  : ""
              }`}
            />
            {formik.touched.password && formik.errors.password && (
              <small className="p-error">{formik.errors.password}</small>
            )}
          </div>
          {err && <p className="error-text">{err}</p>}
          <div className="w-full flex justify-center">
            <Button
              type="submit"
              label="Login"
              loading={loading}
              className="sign_up_btn p-mt-2"
            />
          </div>
        </form>
        <div className="mt-4 text-center">
          <p className="text-[#7077A1]">
            {" Don't have an account? "}
            <button
              onClick={() => signUp.setState(!signUp.state)}
              className="text-[#8b93c2]"
            >
              Switch to Sign Up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

const SignUpContextProvider = createContext();

const Authentication = () => {
  const [signUp, setSignUp] = useState(true);
  const value = {
    state: signUp,
    setState: setSignUp,
  };

  return (
    <SignUpContextProvider.Provider value={value}>
      <>{signUp ? <SignUpForm /> : <LoginForm />}</>
    </SignUpContextProvider.Provider>
  );
};

export default Authentication;
