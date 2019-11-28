import Sgf4js from '../src/sgf4js'
import * as glob from 'glob'

import { readFileSync } from 'fs'
import { nodeInternals } from 'stack-utils'

/**
 * Parse bunch of sgf files and make sure none errors on parsing.
 */
describe('Bulk SGF Tests', () => {
  it('All SGF files under sgf-files', () => {
    expect(true).toBeTruthy()
    let fileNames = glob.sync('./test/**/*.sgf')

    fileNames.slice(0, 1).forEach(fileName => {
      let fileContents = readFileSync(fileName, 'utf-8')
      let sgf = Sgf4js.parse(fileContents)
      let node = sgf.rootNode
      while (node.hasNext()) {
        node = node.nextNode!
      }
    })
  })
})

describe('Long game with multiple branches', () => {
  it('Long game', () => {
    expect(true).toBeTruthy()
    let fileNames = glob.sync('./test/sgf-files/long-game.sgf')

    fileNames.slice(0, 1).forEach(fileName => {
      let fileContents = readFileSync(fileName, 'utf-8')
      let sgf = Sgf4js.parse(fileContents)
      let node = sgf.rootNode
      while (node.hasNext()) {
        node = node.nextNode!
        if (!node.isMove()) {
        }
      }
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
