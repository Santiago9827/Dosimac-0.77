/* eslint-disable prettier/prettier */
import React from 'react';
import Icon from '@expo/vector-icons/Ionicons';




interface Props {
   name: string;
   size?: number;
   color?: string;
}
export const IonIcon = ({ name, size = 25, color = 'black' }: Props) => {

   return (
      <Icon
         name={name}
         size={size}
         color={color}

      />
   )
}
