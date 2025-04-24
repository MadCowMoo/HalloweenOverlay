// Mock URL.createObjectURL for jsdom
global.URL.createObjectURL = jest.fn(() => 'blob:http://localhost/fake');
