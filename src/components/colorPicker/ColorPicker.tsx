import { useState } from "react";

interface ColorPickerProps {
  colors: string[];
  value: string;
  onChange: (color: string) => void;
}

export const ColorPicker = ({
  colors,
  value,
  onChange,
}: ColorPickerProps) => {
  const [isHovering, setIsHovering] = useState(false);
  const onMouseEnter = () => {
    setIsHovering(true);
  };
  const onMouseLeave = () => {
    setIsHovering(false);
  };

  return (
    <div
      className="flex flex-row gap-1 py-2 flex-wrap"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {colors.map((color) => {
        const isSelected = color === value;
        const saturation = !isHovering && !isSelected ? "saturate-[0.25]" : "";
        const borderColor = isSelected
          ? `border border-${color}-800`
          : "border-transparent";
        const opacity = isSelected ? `opacity-100` : "opacity-20";
        return (
          <div
            key={color}
            className={`${saturation} rounded-md p-1 border-2 ${borderColor} cursor-pointer hover:opacity-100 transition transition-all duration-200 ${opacity} hover:scale-[1.05]`}
            onClick={() => {
              onChange(color);
            }}
          >
            <div className={`w-5 h-5 bg-${color}-500 rounded-sm`}></div>
          </div>
        );
      })}
    </div>
  );
};
