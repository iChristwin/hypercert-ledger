"use client";
import CreatableSelect from "react-select/creatable";
import { useState } from "react";

interface CreateSelectProps {
  placeholder: string;
  value: readonly Option[];
  setValue: React.Dispatch<React.SetStateAction<readonly Option[]>>;
}
export interface Option {
  readonly label: string;
  readonly value: string;
}

const createOption = (label: string) => ({
  label,
  value: label,
});

function CreateSelect({ placeholder, value, setValue }: CreateSelectProps) {
  const [inputValue, setInputValue] = useState("");
  const handleKeyDown: React.KeyboardEventHandler = (event) => {
    if (!inputValue) return;
    switch (event.key) {
      case "Enter":
      case "Tab":
        setValue((prev) => [...prev, createOption(inputValue)]);
        setInputValue("");
        event.preventDefault();
    }
  };

  return (
    <CreatableSelect
      value={value}
      isMulti
      placeholder={placeholder}
      inputValue={inputValue}
      menuIsOpen={false}
      onKeyDown={handleKeyDown}
      onChange={(newValue) => setValue(newValue)}
      onInputChange={(newValue) => setInputValue(newValue)}
      styles={{
        //@ts-ignore
        control: (baseStyles) => ({
          ...baseStyles,
          backgroundColor: "#ffffff80;",
          ":focus": {
            outline: "hidden",
          },
        }),
      }}
    />
  );
}

export default CreateSelect;