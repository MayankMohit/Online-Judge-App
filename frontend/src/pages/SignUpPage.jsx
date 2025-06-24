import { motion } from 'framer-motion';
import Input from '../components/Input';
import { User, Mail, Lock, Loader } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PasswordStrengthMeter from '../components/PasswordStrengthMeter';
// import { useAuthStore } from '../store/authStore';
import { useNavigate, useLocation } from 'react-router-dom';

const SignUpPage = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    // const { signup, error, isLoading, setError } = useAuthStore();
    // if(error) setError(null)
    const navigate = useNavigate();
    const location = useLocation();

    // useEffect(() => {
    //     if (location.pathname === '/login') {
    //       setError(null);
    //     }
    //   }, [location.pathname, setError]);

    const handleSignUp = async (e) => {
        e.preventDefault();
        try {
            await signup(email, password, name);
            navigate('/verify-email');
        }catch (error) {
            console.log(error);
            setTimeout(() => set({ error: null }), 3000);
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className='max-w-md w-full bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-xl rounded-2xl shadow-xl 
            overflow-hidden'>
            <div className='p-8'>
                <h2 className='text-3xl font-bold mb-6 text-center bg-gradient-to-r from-purple-400 to-purple-500 text-transparent bg-clip-text'>
                    Create an Account
                </h2>

             <form onSubmit={handleSignUp}>
                <Input icon={User} type='text' placeholder='Full Name'
                    value={name} onChange={(e) => setName(e.target.value)} />
                <Input icon={Mail} type='email' placeholder='Email Address'
                    value={email} onChange={(e) => setEmail(e.target.value)} />
                <Input icon={Lock} type='password' placeholder='Password'
                    value={password} onChange={(e) => setPassword(e.target.value)} />

                {/* {error && <p className='text-red-500 font-semibold mt-2'>{error}</p>} */}

                <PasswordStrengthMeter password={password} />
                <motion.button type='submit' whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} // disabled={isLoading}
                    className='w-full py-3 mt-5 bg-gradient-to-r from-purple-500 to-purple-600
                     text-white font-bold rounded-lg shadow-lg hover:from-purple-600 hover:to-purple-700 
                     focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2
                     focus:ring-offset-gray-900 transition duration-200'> Sign Up
                     {/* {isLoading ? <Loader className="animate-spin mx-auto" size={24} /> : 'Sign Up'} */}
                 </motion.button>

            </form>      
            </div>
        
            <div className='px-8 py-4 bg-gray-900 bg-opacity-50 flex justify-center'>
                <p className='text-sm text-gray-400'>
                    Already have an account?{" "}
                    <Link to={"/login"} className='text-purple-400 hover:underline'>Login</Link>
                </p>
            </div>
        </motion.div>
  )
}

export default SignUpPage