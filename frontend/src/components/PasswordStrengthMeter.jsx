import { Check, X } from 'lucide-react'

const PasswordCriteria = ({ password }) => { 
    const criteria = [
        { label: 'At least 8 characters', met: password.length >= 8 },
        { label: 'Contains uppercase letter', met: /[A-Z]/.test(password) },
        { label: 'Contains lowercase letter', met: /[a-z]/.test(password) },
        { label: 'Contains a number', met: /\d/.test(password) },
        { label: 'Contains a special character', met: /[^A-Za-z0-9]/.test(password) },
    ]
    return (
        <div className='mt-2 space-y-1'>
            {criteria.map((item, index) => (
                <div key={index} className="flex items-center text-xs">
                    {item.met ? (
                        <Check className="size-4 text-green-500 mr-2" />
                    ) : (
                        <X className="size-4 text-gray-500 mr-2" />
                    )}
                    <span className={item.met ? 'text-green-500' : 'text-gray-500'}>{item.label}</span>
                </div>
            ))}
            
        </div>
    )
}

const PasswordStrengthMeter = ({password}) => {
    const getStrength = (pass) => {
        const criteria = [
            pass.length >= 8,
            /[A-Z]/.test(pass) && /[a-z]/.test(pass),
            /\d/.test(pass),
            /[^A-Za-z0-9]/.test(pass),
        ]
        const metCriteria = criteria.filter(Boolean).length
        return metCriteria;
    }
    
    const strength = getStrength(password)
    const getStrengthText = (strength) => {
        switch (strength) {
            case 0:
                return 'Very Weak'
            case 1:
                return 'Weak'
            case 2:
                return 'Fair'
            case 3:
                return 'Good'
            case 4:
                return 'Strong'
            default:
                return ''
        }
    }
    const getColor = (strength) => {
        switch (strength) {
            case 0:
                return 'bg-red-500'
            case 1:
                return 'bg-red-500'
            case 2:
                return 'bg-red-400'
            case 3:
                return 'bg-yellow-400'
            case 4:
                return 'bg-green-500'
            default:
                return ''
        }
    }

    return <div className='mt-2'>
        <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-400">Password Strength</span>
            <span className="text-xs text-gray-400">{getStrengthText(strength)}</span>
        </div>
        <div className='flex space-x-1'>
            {[...Array(4)].map((_, index) => (
                <div key={index} className={`h-1 w-1/4 rounded-full transition-colors duration-300
                    ${index < strength ? getColor(strength) : "bg-gray-600"} `} />
            ))}
        </div>
        <PasswordCriteria password={password} />
    </div>
}

export default PasswordStrengthMeter