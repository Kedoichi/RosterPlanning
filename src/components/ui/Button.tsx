// src/components/ui/Button.tsx

type ButtonProps = {
    children: React.ReactNode;
    onClick?: () => void;
  };
  
  const Button = ({ children, onClick }: ButtonProps) => {
    return (
      <button
        onClick={onClick}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        {children}
      </button>
    );
  };
  
  export default Button;
  