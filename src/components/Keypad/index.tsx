import { FaDeleteLeft, FaPlus } from "react-icons/fa6";
import { Dispatch, SetStateAction, useState } from "react";

interface KeypadProps {
  phoneInput: string;
  setPhoneInput: Dispatch<SetStateAction<string>>;
  onSave: (fullNumber: string, countryCode: string) => void;
}

const Keypad: React.FC<KeypadProps> = ({ phoneInput, setPhoneInput, onSave }) => {
    const [countryCode, setCountryCode] = useState("+1");

    const handleSave = () => {
        const fullNumber = `${countryCode}${phoneInput}`;
        console.log("Saving number:", fullNumber);
        onSave(fullNumber, countryCode);
    };

    return (
        <div className="absolute bottom-16 left-0 right-0 bg-white border-t p-4 rounded-t-2xl shadow-md z-10">
            <div className="flex items-center gap-2 mb-3">
                {/* Country Code Dropdown */}
                <div className="w-32">
                    <select
                        value={countryCode}
                        onChange={(e) => setCountryCode(e.target.value)}
                        className="w-full border p-2 rounded-lg text-sm bg-gray-100"
                    >
                        {countries.map((c) => (
                            <option key={c.code} value={c.code}>
                                {c.name} ({c.code})
                            </option>
                        ))}
                    </select>
                </div>

                {/* Phone Number Input */}
                <div className="relative flex-1">
                    <input
                        type="text"
                        value={phoneInput}
                        onChange={(e) => setPhoneInput(e.target.value)}
                        className="w-full p-2 pr-10 border rounded-lg text-center text-lg"
                        placeholder="Enter phone number"
                    />
                    {phoneInput && (
                        <button
                            onClick={() => setPhoneInput((prev: string) => prev.slice(0, -1))}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 text-lg"
                        >
                            <FaDeleteLeft />
                        </button>
                    )}
                </div>

                {/* Save Button */}
                <button
                    onClick={handleSave}
                    className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-full"
                >
                    <FaPlus />
                </button>
            </div>


            {/* Keypad Buttons */}
            <div className="grid grid-cols-3 gap-3 text-center text-lg font-semibold">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', '+', '0', '#'].map((d) => (
                    <button key={d} onClick={() => setPhoneInput((prev: string) => prev + d)} className="bg-gray-200 p-4 rounded-xl">
                        {d}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default Keypad;
export const countries = [
    { name: "U. S.", code: "+1" },
    { name: "United Kingdom", code: "+44" },
    { name: "India", code: "+91" },
    { name: "Canada", code: "+1" },
    { name: "Australia", code: "+61" },
    { name: "Germany", code: "+49" },
    { name: "France", code: "+33" },
    { name: "Italy", code: "+39" },
    { name: "Spain", code: "+34" },
    { name: "Brazil", code: "+55" },
    { name: "Mexico", code: "+52" },
    { name: "China", code: "+86" },
    { name: "Japan", code: "+81" },
    { name: "South Korea", code: "+82" },
    { name: "Russia", code: "+7" },
    { name: "South Africa", code: "+27" },
    { name: "Nigeria", code: "+234" },
    { name: "Egypt", code: "+20" },
    { name: "Saudi Arabia", code: "+966" },
    { name: "United Arab Emirates", code: "+971" },
    { name: "Turkey", code: "+90" },
    { name: "Indonesia", code: "+62" },
    { name: "Pakistan", code: "+92" },
    { name: "Bangladesh", code: "+880" },
    { name: "Sri Lanka", code: "+94" },
    { name: "Nepal", code: "+977" },
    { name: "Thailand", code: "+66" },
    { name: "Vietnam", code: "+84" },
    { name: "Malaysia", code: "+60" },
    { name: "Singapore", code: "+65" },
    { name: "Philippines", code: "+63" },
    { name: "Argentina", code: "+54" },
    { name: "Colombia", code: "+57" },
    { name: "Chile", code: "+56" },
    { name: "Peru", code: "+51" },
    { name: "Venezuela", code: "+58" },
    { name: "Netherlands", code: "+31" },
    { name: "Belgium", code: "+32" },
    { name: "Switzerland", code: "+41" },
    { name: "Sweden", code: "+46" },
    { name: "Norway", code: "+47" },
    { name: "Denmark", code: "+45" },
    { name: "Finland", code: "+358" },
    { name: "Ireland", code: "+353" },
    { name: "Poland", code: "+48" },
    { name: "Austria", code: "+43" },
    { name: "New Zealand", code: "+64" },
    { name: "Greece", code: "+30" },
    { name: "Portugal", code: "+351" },
    { name: "Czech Republic", code: "+420" },
    { name: "Hungary", code: "+36" },
    { name: "Israel", code: "+972" }
];
