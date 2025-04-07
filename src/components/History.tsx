interface HistoryItem {
  id: string;
  from: string;
  to: string;
  message: string;
  date: string;
}

const History = ({
  history,
  loading,
}: {
  history: HistoryItem[];
  loading: boolean;
}) => {
  return (
    <div className="mt-6 max-h-80 overflow-y-auto border-t pt-4 px-2">
      <h3 className="text-xl font-semibold mb-4 text-center text-gray-700">
        Message History
      </h3>

      {loading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-16 bg-gray-200 animate-pulse rounded-md"
            />
          ))}
        </div>
      ) : history.length === 0 ? (
        <p className="text-center text-gray-500">No messages found.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {history.map((item) => (
            <div
              key={item.id}
              className="border rounded-lg p-3 bg-gray-50 shadow-sm"
            >
              <div className="text-xs text-gray-500">
                From: {item.from} → To: {item.to}
              </div>
              <div className="text-gray-800 text-base mb-1"><span className="font-bold">Message: </span>{item.message}</div>
              <div className="text-sm text-gray-600 mb-1 text-right">
                {new Date(item.date).toLocaleString()}
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default History;

