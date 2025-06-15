import ModelSelector from './ModelSelector';

const ChatInterface: React.FC = () => {
  const {
    messages,
    isLoading,
    error,
    selectedModel,
    sendMessage,
    clearConversation,
    setSelectedModel,
  } = useChat();

  return (
    <div className='flex flex-col h-screen bg-gray-900 text-white'>
      <header className='border-b border-gray-800 p-4'>
        <div className='max-w-4xl mx-auto flex justify-between items-center'>
          <h1 className='text-xl font-bold'>Groq Chat</h1>
          <div className='flex items-center gap-4'>
            <ModelSelector
              selectedModel={selectedModel}
              onModelChange={setSelectedModel}
            />
            <button
              onClick={clearConversation}
              className='text-sm text-gray-400 hover:text-white'
            >
              Clear Chat
            </button>
          </div>
        </div>
      </header>

      {/* ... rest of the component ... */}
    </div>
  );
};

export default ChatInterface;
