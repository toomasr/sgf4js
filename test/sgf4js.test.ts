import Sgf4js from '../src/sgf4js'
import * as glob from 'glob'

import { readFileSync } from 'fs'

/**
 * Dummy test
 */
describe('Bulk SGF Tests', () => {
  it('All SGF files under sgf-files', () => {
    expect(true).toBeTruthy()
    let fileNames = glob.sync('./test/**/*.sgf')
    
    fileNames.slice(0, 1).forEach(fileName => {
      let fileContents = readFileSync(fileName, 'utf-8')
      let sgf = Sgf4js.parse(fileContents)
      console.log(sgf.rootNode)
    })
  })
})

/*

const Sgf4js = require('../sgf4js.js');

const sgf4js = new Sgf4js();

test('adds 1 + 2 to equal 3', () => {
  console.log(sgf4js.parse());
  //expect(sgf4js.parse().toBe("hello world!"));
});

*/
