import { useState } from 'react';
import { Button, Icon } from '@chakra-ui/react';
import { FaHeart } from 'react-icons/fa';

function LikeButton({ isLiked, onLikeButtonClick }) {
  return (
    <Button onClick={onLikeButtonClick} variant="ghost" colorScheme={isLiked ? 'red' : 'gray'}>
      <Icon as={FaHeart} color={isLiked ? 'red.500' : 'gray.500'} />
    </Button>
  );
};

export default LikeButton;