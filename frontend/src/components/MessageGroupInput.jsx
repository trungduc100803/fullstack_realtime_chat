import { useRef, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { Image, Send, X, Paperclip } from "lucide-react";
import toast from "react-hot-toast";
import {encryptText} from '../lib/crypto'


const MessageGroupInput = () => {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const { sendMessageGroup } = useChatStore();
  const [fileName, setFileName] = useState("");
  const [fileMimeType, setFileMimeType] = useState("");
  const fileRef = useRef(null);
  const [fileData, setFileData] = useState(null);


  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // const handleSendMessage = async (e) => {
  //   e.preventDefault();
  //   if (!text.trim() && !imagePreview) return;

  //   try {
  //     await sendMessageGroup({
  //       text: text.trim(),
  //       image: imagePreview,
  //     });

  //     // Clear form
  //     setText("");
  //     setImagePreview(null);
  //     if (fileInputRef.current) fileInputRef.current.value = "";
  //   } catch (error) {
  //     console.error("Failed to send message:", error);
  //   }
  // };

  const handleFileUpload = (e) => {
      const file = e.target.files[0];
      if (!file) return;
    
      const reader = new FileReader();
      reader.onloadend = () => {
        setFileData(reader.result); // base64 string
        setFileName(file.name);
        setFileMimeType(file.type);
      };
      reader.readAsDataURL(file);
    };
    
  
    const handleSendMessage = async (e) => {
      e.preventDefault();
      if (!text.trim() && !imagePreview && !fileData) return;
      
      try {
        const encrypted = encryptText(text.trim());
        await sendMessageGroup({
          text: encrypted.data,
          iv: encrypted.iv,
          image: imagePreview,
          file: fileData,
          fileType: fileMimeType,
          fileName
        });
    
        setText("");
        setImagePreview(null);
        setFileData(null);
        setFileName("");
        setFileMimeType("");
        if (fileInputRef.current) fileInputRef.current.value = "";
        if (fileRef.current) fileRef.current.value = "";
      } catch (error) {
        console.error("Failed to send message:", error);
      }
    };
    

  return (
    <div className="p-4 w-full">
      {imagePreview && (
        <div className="mb-3 flex items-center gap-2">
          <div className="relative">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-20 h-20 object-cover rounded-lg border border-zinc-700"
            />
            <button
              onClick={removeImage}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-base-300
              flex items-center justify-center"
              type="button"
            >
              <X className="size-3" />
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSendMessage} className="flex items-center gap-2">
        <div className="flex-1 flex gap-2">
          <input
            type="text"
            className="w-full input input-bordered rounded-lg input-sm sm:input-md"
            placeholder="Nhập tin nhắn..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleImageChange}
          />
          {fileName && (
                      <div className="mb-2 text-sm text-zinc-300 flex items-center gap-2">
                        📎 {fileName}
                        <button
                          onClick={() => {
                            setFileData(null);
                            setFileName("");
                            setFileMimeType("");
                            if (fileRef.current) fileRef.current.value = "";
                          }}
                          className="text-red-500"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    )}

          <button
            type="button"
            className={`hidden sm:flex btn btn-circle
                     ${imagePreview ? "text-emerald-500" : "text-zinc-400"}`}
            onClick={() => fileInputRef.current?.click()}
          >
            <Image size={20} />
          </button>
          <input
            type="file"
            accept=".pdf,.doc,.docx,.ppt,.pptx,.zip"
            className="hidden"
            ref={fileRef}
            onChange={handleFileUpload}
          />

          <button
            type="button"
            className="hidden sm:flex btn btn-circle text-zinc-400"
            onClick={() => fileRef.current?.click()}
            title="Gửi file"
          >
            <Paperclip />
          </button>
        </div>
        <button
          type="submit"
          className="btn btn-sm btn-circle"
          disabled={!text.trim() && !imagePreview && !fileData}
        >
          <Send size={22} />
        </button>
      </form>
    </div>
  );
};
export default MessageGroupInput;
