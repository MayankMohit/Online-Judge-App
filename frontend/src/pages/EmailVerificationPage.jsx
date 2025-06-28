import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { toast } from 'react-hot-toast'

const EmailVerificationPage = () => {
    const [code, setCode] = useState(["", "", "", "", "", ""]);
    const inputRefs = useRef([]);
    const navigate = useNavigate();
    const { error, isLoading, verifyEmail, setError } = useAuthStore();
    if(error) setError(null)
    const handleChange = (index, value) => {
        const newCode = [...code];
        if (value.length > 1) {
            const pastedCode = value.split('').slice(0, 6);
            for (let i = 0; i < pastedCode.length; i++) {
                newCode[i] = pastedCode[i];
            }
            setCode(newCode);
            const lastFilledIndex = newCode.findLastIndex(digit => digit !== "");
            const focusIndex = lastFilledIndex < 5 ? lastFilledIndex + 1 : 5;
            inputRefs.current[focusIndex].focus();
        } else {
            newCode[index] = value;
            setCode(newCode);
            if(value && index < 5) {
                inputRefs.current[index + 1].focus();
            }
        }
     }

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && index > 0 && !code[index]) {
            inputRefs.current[index - 1].focus();
        }
    
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        const verificationCode = code.join("");
        try {
            await verifyEmail(verificationCode);
            navigate("/login")
            toast.success("Email verified successfully!");
        } catch (error) { 
            console.error(error);
        }
    }

    useEffect(() => { 
        if(code.every((digit) => digit !== "")) {
            handleSubmit(new Event('submit'));
        }
    }, [code])
    
    return (
        <div className='max-w-md w-full bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-xl 
            rounded-2xl shadow-xl overflow-hidden'>
            <motion.div
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className='bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-xl rounded-2xl 
                    shadow-2xl p-8 max-w-md w-full'>
                <h2 className='text-3xl font-bold mb-6 text-center bg-gradient-to-r from-purple-400
                 to-purple-500 text-transparent bg-clip-text'>
                    Verify Your Email
                </h2>
                <p className='text-center text-gray-500 mb-6'>
                    Enter the verification code sent to your email.
                </p>
                <form onSubmit={ handleSubmit } className='space-y-6'>
                    <div className='flex justify-between'>
                        {code.map((digit, index) => (
                            <input
                                key={index}
                                type='text'
                                maxLength='6'
                                value={digit}
                                onChange={(e) => handleChange(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                ref={(el) => (inputRefs.current[index] = el)}
                                className='w-12 h-12 text-center text-2xl font-bold bg-gray-700 
                                    rounded-lg text-white border-2 border-gray-500 focus:outline-none
                                    focus:border-purple-500'
                            />
                        ))}
                    </div>
                    {error && <p className='text-red-500 font-semibold mt-2'>{error}</p>}
                    <motion.button
                        type='submit'
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className='w-full py-3 px-4 bg-gradient-to-r from-purple-500 to-purple-600
                         text-white font-bold rounded-lg shadow-lg hover:from-purple-600
                          hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 
                          focus:ring-opacity-50 disabled:opacity-50'
                        disabled={isLoading || code.some(digit => !digit)}
                    >
                        {isLoading ? 'Verifying...' : 'Verify Email'}
                    </motion.button>
                </form>
            </motion.div>
        </div>
    )
}

export default EmailVerificationPage