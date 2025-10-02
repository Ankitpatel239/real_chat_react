import React from 'react';

interface CallHistoryProps {
  callHistory: any[];
}

const CallHistory: React.FC<CallHistoryProps> = ({ callHistory }) => {
  const formatDateTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCallDuration = (started: string, ended: string) => {
    if (!ended) return 'In progress';
    const duration = new Date(ended).getTime() - new Date(started).getTime();
    const minutes = Math.floor(duration / 60000);
    const seconds = Math.floor((duration % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (callHistory.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
      <h3 className="font-semibold text-gray-900 mb-4">Call History</h3>
      <div className="space-y-3 max-h-60 overflow-y-auto">
        {callHistory.map((call) => (
          <div key={call.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-full ${
                call.call_type === 'video' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'
              }`}>
                {call.call_type === 'video' ? '📹' : '📞'}
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900">
                  {call.initiator_name}
                </div>
                <div className="text-xs text-gray-500">
                  {formatDateTime(call.started_at)}
                </div>
              </div>
            </div>
            <div className="text-xs text-gray-500">
              {getCallDuration(call.started_at, call.ended_at)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CallHistory;