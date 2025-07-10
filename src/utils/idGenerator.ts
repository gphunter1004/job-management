// src/utils/idGenerator.ts

/**
 * Pseudo-UUID를 생성합니다. (진정한 UUID는 아니지만 고유값 생성에 유용)
 * @returns {string} UUID 형식의 문자열
 */
export const generatePseudoUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0,
      v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};