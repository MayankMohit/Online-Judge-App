import { motion } from 'framer-motion'
import { useState } from 'react'
import { useAuthStore } from '../store/authStore'
import Input from '../components/Input'
import { Loader, Mail, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

const ForgotPasswordPage = () => {

    const [email, setEmail] = useState('')
    const [isSubmitted, setIsSubmitted] = useState(false)
    const { isLoading, forgotPassword } = useAuthStore();
    
    const handleSubmit = async (e) => { 
        e.preventDefault()
        try {
            await forgotPassword(email)
            setIsSubmitted(true)
        } catch (error) {
            console.error(error)
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className='max-w-md w-full bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-xl
             rounded-2xl shadow-xl overflow-hidden'>
            <div className='p-8'>
                <h2 className='text-3xl font-bold mb-6 text-center bg-gradient-to-r
                 from-purple-400 to-purple-500 text-transparent bg-clip-text'>
                    Forgot Password 
                </h2>

                {!isSubmitted ? (
                    <form onSubmit={handleSubmit}>
                        <p className='text-gray-400 mb-6 text-sm text-center'>
                            Enter your email address to receive a password reset link.</p>
                        <Input icon={Mail} type='email' placeholder='Email Address'
                            value={email} onChange={(e) => setEmail(e.target.value)} required />
                        <motion.button type='submit'
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            disabled={isLoading}
                            className='w-full py-3 px-4 bg-gradient-to-r from-purple-500
                             to-purple-600 text-white font-bold rounded-lg shadow-lg
                              hover:from-purple-600 hover:to-purple-700 focus:outline-none
                              focus:ring-2 focus:ring-purple-500 focus:ring-offset-2
                               focus:ring-offset-gray-900 transition duration-200'>
                            {isLoading ? <Loader className='size-6 animate-spin mx-auto' /> : 'Send Reset Link'}
                        </motion.button>
                    </form>
                ) : (
                    <div className="text-center">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                className="w-16 h-16 bg-purple-500 rounded-full flex items-center 
                                justify-center mx-auto mb-4">
                                <Mail className="w-8 h-8 text-white" />
                        </motion.div>  
                        <p className='text-gray-300 mb-6'>A password reset link has been sent to {email}.</p>  
                    </div>
                )}
            </div>
            <div className='px-8 py-4 bg-gray-900 bg-opacity-50 flex justify-center'>
                <Link to="/login" className='text-sm text-purple-400 hover:underline flex items-center'>
                    <ArrowLeft className="size-4 mr-2" />Back to Login
                </Link>

            </div>
        </motion.div>
    )
}

export default ForgotPasswordPage