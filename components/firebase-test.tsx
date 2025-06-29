"use client";

import { useEffect, useState } from 'react';
import { testFirebaseConnection, testGoogleSignIn } from '@/lib/firebase-test';
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth';

export const FirebaseTest = () => {
  const [connectionStatus, setConnectionStatus] = useState<any>(null);
  const [testResult, setTestResult] = useState<any>(null);
  const { user, loading } = useFirebaseAuth();

  useEffect(() => {
    // Test Firebase connection on component mount
    const status = testFirebaseConnection();
    setConnectionStatus(status);
  }, []);

  const handleTestSignIn = async () => {
    const result = await testGoogleSignIn();
    setTestResult(result);
  };

  return (
    <div className="p-4 border rounded-lg bg-white shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Firebase Test</h3>
      
      <div className="space-y-4">
        <div>
          <h4 className="font-medium">Connection Status:</h4>
          <pre className="text-sm bg-gray-100 p-2 rounded">
            {JSON.stringify(connectionStatus, null, 2)}
          </pre>
        </div>

        <div>
          <h4 className="font-medium">Auth State:</h4>
          <p>Loading: {loading ? 'Yes' : 'No'}</p>
          <p>User: {user?.email || 'Not signed in'}</p>
        </div>

        <button
          onClick={handleTestSignIn}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Test Google Sign In
        </button>

        {testResult && (
          <div>
            <h4 className="font-medium">Test Result:</h4>
            <pre className="text-sm bg-gray-100 p-2 rounded">
              {JSON.stringify(testResult, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}; 