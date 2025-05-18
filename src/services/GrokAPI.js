import axios from "axios";
import { Alert } from "react-native";


export const fetchProductDescription = async (base64Image, APIkey, prompt) => {
  try {

    const response = await axios.post(
      'https://api.x.ai/v1/chat/completions',
      {
        model: 'grok-2-vision-1212',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: prompt,
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`,
                },
              },
            ],
          },
        ],
      },
      {
        headers: {
          Authorization: 'Bearer ' + APIkey,
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      }
    );
    console.log('Grok API response:', response.data);
    const description = response.data.choices[0].message.content;
    return description

  } catch (error) {
    console.error('Grok API request failed:', error);
    if (error.response) {
      console.error('Error response:', error.response.data);
      Alert.alert('錯誤', '網絡有問題，請檢查網絡後重試。', [{ text: '確定' }]);
    } else {
      console.error('Error message:', error.message);
      Alert.alert('錯誤', '無法處理圖片，請稍後再試。', [{ text: '確定' }]);
    }
  }
};

export const extractJsonFromMarkdown = (text) => {
  const match = text.toString().match(/```json\s*({[\s\S]*?})\s*```/);
  return match ? match[1] : text;
};

export const flattenJson = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj;
  const flat = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'object' && !Array.isArray(value)) {
      for (const [subKey, subValue] of Object.entries(value)) {
        flat[subKey] = subValue;
      }
    } else {
      flat[key] = value;
    }
  }
  return flat;
};
