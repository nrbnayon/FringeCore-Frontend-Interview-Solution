// src/App.tsx

import React from "react";
import { observer } from "mobx-react-lite";
import PartitionStore from "./stores/PartitionStore";
import Partition from "./components/Partition";

const App: React.FC = observer(() => {
  return (
    <div className='w-screen h-screen'>
      {PartitionStore.rootPartition && (
        <Partition partition={PartitionStore.rootPartition} />
      )}
    </div>
  );
});

export default App;
