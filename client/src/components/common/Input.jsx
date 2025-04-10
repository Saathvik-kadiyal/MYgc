const Input = ({
  type = 'text',
  label,
  name,
  value,
  onChange,
  error,
  placeholder,
  required = false,
  disabled = false,
  className = '',
  icon,
  onIconClick
}) => {
  return (
    <div className="w-full">
      {label && (
        <label 
          htmlFor={name} 
          className="block text-sm sm:text-base font-medium text-white mb-2 transition-all"
        >
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <input
          type={type}
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          placeholder={placeholder}
          required={required}
          className={`
            w-full rounded-lg border-2 bg-gray-900
            border-gray-700
            focus:border-gray-600 focus:ring-2 focus:ring-blue-500
            disabled:bg-gray-800 disabled:cursor-not-allowed
            placeholder:text-gray-500
            ${error ? 'border-red-500' : 'border-gray-700'}
            ${icon ? 'pl-10' : 'px-4'}
            ${className}
            text-white
            py-2.5 sm:py-3
            text-base sm:text-lg
            transition-all duration-200 ease-in-out
            hover:border-gray-600
            outline-none
          `}
        />
        {icon && (
          <div 
          onClick={onIconClick}
          className={`absolute inset-y-0 left-0 pl-3 flex items-center 
                     pointer-events-${onIconClick ? 'auto' : 'none'} 
                     text-gray-400 hover:text-white cursor-${onIconClick ? 'pointer' : 'default'}`}
          
          >
            {icon}
          </div>
        )}
      </div>
      {error && (
        <p className="mt-2 text-sm sm:text-base text-red-400 transition-all">
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;