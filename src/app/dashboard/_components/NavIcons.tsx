import type { IconType } from "react-icons";
import {
  LuBell,
  LuLayoutDashboard,
  LuSquarePlay,
  LuSearch,
  LuSettings,
  LuUser,
  LuUsers,
} from "react-icons/lu";

function navIcon(Icon: IconType) {
  return function NavIcon(props: React.SVGProps<SVGSVGElement>) {
    return <Icon className="crm-nav-icon" {...props} />;
  };
}

export const DashboardIcon = navIcon(LuLayoutDashboard);
export const TraineesIcon = navIcon(LuUsers);
export const VideosIcon = navIcon(LuSquarePlay);
export const TrainersIcon = navIcon(LuUser);
export const SettingsIcon = navIcon(LuSettings);

export const BellIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <LuBell size={18} {...props} />
);

export const SearchIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <LuSearch size={13} {...props} />
);
