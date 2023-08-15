import React, { useEffect, useState } from 'react';

function MarkdownsPage() {
  const [folders, setFolders] = useState([]);

  const getFolders = async () => {
    const response = await fetch('http://127.0.0.1:8000/api/folders/');
    const data = await response.json();
    console.log('Data:', data);
    setFolders(data);
  };

  useEffect(() => {
    getFolders();
  }, []);

  return (
    <div>
      <div className="markdonws">
        {folders.map((folder) => (
          <h3>
            {folder.id}
            ,
            {folder.name}
          </h3>
        ))}
      </div>
    </div>
  );
}

export default MarkdownsPage;
