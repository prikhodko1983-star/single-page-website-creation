const PetrovLogo = ({ className = "" }: { className?: string }) => {
  return (
    <div className={`relative inline-block ${className}`}>
      <div className="relative border-4 border-primary rounded px-6 py-2">
        <span className="font-oswald font-bold text-3xl text-foreground tracking-wider">
          ПЕТРОВ
        </span>
        <div className="absolute -bottom-3 -right-3 w-8 h-8 bg-primary rounded-full"></div>
      </div>
    </div>
  );
};

export default PetrovLogo;
