import vue from 'rollup-plugin-vue'; // Handle .vue SFC files
import buble from 'rollup-plugin-buble'; // Transpile/polyfill with reasonable browser support
export default {
  input: 'src/components/wrapper.js', // Path relative to package.json
  output: {
    name: 'VueFilterControl',
    exports: 'named',
    globals: {
      vue: 'Vue',
      'vue2-selectize': 'Selectize'
    }
  },
  external: [
    'vue',
    'vue2-selectize'
  ],
  plugins: [
    vue({
      css: true, // Dynamically inject css as a <style> tag
      compileTemplate: true, // Explicitly convert template to render function
    }),
    buble(), // Transpile to ES5
  ],
};
