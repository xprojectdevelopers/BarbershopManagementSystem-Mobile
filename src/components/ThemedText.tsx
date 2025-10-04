import React from 'react';
import { Text, TextStyle, StyleProp } from 'react-native';

type Variant = 'title' | 'body' | 'caption' | 'button' | 'profile' | 'subtitle';

interface ThemedTextProps {
  variant: Variant;
  style?: StyleProp<TextStyle>;
  children: React.ReactNode;
}

const ThemedText: React.FC<ThemedTextProps> = ({ variant, style, children }) => {
  const getVariantStyle = (variant: Variant): TextStyle => {
    switch (variant) {
      case 'title':
        return {
          fontSize: 24,
          fontFamily: 'Satoshi-Bold',
          color: '#000',
        };
      case 'subtitle':
        return {
          fontSize: 20,
          fontFamily: 'Satoshi-Medium',
          color: '#000',
        };
      case 'body':
        return {
          fontSize: 16,
          fontFamily: 'Satoshi-Regular',
          color: '#000',
        };
      case 'caption':
        return {
          fontSize: 14,
          fontFamily: 'Satoshi-Regular',
          color: '#666',
        };
      case 'button':
        return {
          fontSize: 16,
          fontFamily: 'Satoshi-Bold',
          color: '#fff',
        };
      case 'profile':
        return {
          fontSize: 30,
          fontFamily: 'Satoshi-Bold',
          color: '#fff',
        };
      default:
        return {
          fontSize: 16,
          fontFamily: 'Satoshi-Regular',
          color: '#000',
        };
    }
  };

  return (
    <Text style={[getVariantStyle(variant), style]}>
      {children}
    </Text>
  );
};

export default ThemedText;
