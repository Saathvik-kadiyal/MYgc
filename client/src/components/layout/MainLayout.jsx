import { Outlet } from 'react-router-dom';
import LeftSidebar from './LeftSidebar';
import RightSidebar from './RightSidebar';

const MainLayout = () => {
  return (
    <div className="min-h-screen bg-gray-900 flex justify-center">
      {/* Main container with LinkedIn-like width */}
      <div className="w-[1128px] relative">
        <div className="flex justify-between">
          
          {/* Left Sidebar - Fixed width */}
          <div className="w-[225px] h-screen sticky top-0">
            <div className="w-full h-full border-r border-gray-800 bg-transparent">
              <LeftSidebar />
            </div>
          </div>

          {/* Main Content - Fixed width */}
          <div className="w-[555px] py-6 bg-gray-900">
            <Outlet />
          </div>

          {/* Right Sidebar - Fixed width */}
          <div className="w-[300px] h-screen sticky top-0">
            <div className="w-full h-full border-l border-gray-800 bg-transparent">
              <RightSidebar />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default MainLayout;
