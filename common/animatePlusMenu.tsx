import './animatePlusMenu.css'; // 引入CSS文件

import React, { useState } from 'react';
import {
  BsArrowRepeat,
  BsHandThumbsDown,
  BsHeart,
  BsPlusCircle,
  BsXCircle,
} from 'react-icons/bs';
import { MdExpand } from 'react-icons/md';

interface AnimatedPlusMenuProps {
  onRefresh?: () => void; // onRefresh 是一个可选的函数参数
  onLike?: () => void;
  onDislike?: () => void;
  onExpand?: () => void;
}

const AnimatedPlusMenu = ({
  onRefresh,
  onLike,
  onDislike,
  onExpand,
}: AnimatedPlusMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="menu-container">
      <div
        className="menu-toggle"
        onClick={toggleMenu}
        title={isOpen ? '关闭菜单' : '打开菜单'}
      >
        {isOpen ? <BsXCircle /> : <BsPlusCircle />}
      </div>
      {isOpen && (
        <div className="menu-items">
          {onLike && (
            <BsHeart
              color="green"
              className="menu-item"
              onClick={onLike}
              title="喜欢"
            />
          )}
          {onDislike && (
            <BsHandThumbsDown
              className="menu-item"
              onClick={onDislike}
              title="不喜欢"
            />
          )}
          {onRefresh && (
            <BsArrowRepeat
              className="menu-item"
              onClick={onRefresh}
              title="刷新"
            />
          )}
          {onExpand && (
            <MdExpand className="menu-item" onClick={onExpand} title="展开" />
          )}
          <BsXCircle className="menu-item" onClick={toggleMenu} title="关闭" />
        </div>
      )}
    </div>
  );
};

export default AnimatedPlusMenu;
