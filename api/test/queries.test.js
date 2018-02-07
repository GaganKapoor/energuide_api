import { MongoClient } from 'mongodb'
import request from 'supertest'
import Server from '../src/server'

let client, db, collection
const url = 'mongodb://localhost:27017'
const dbName = 'energuide'

describe('queries', () => {
  beforeAll(async () => {
    client = await MongoClient.connect(url)
    db = client.db(dbName)
    collection = db.collection('dwellings')
  })

  afterAll(async () => {
    client.close()
  })

  describe('evaluationsFor', () => {
    it('retrieves evaluations given an account id and a postalcode', async () => {
      let server = new Server({
        client: collection,
      })

      let response = await request(server)
        .post('/graphql')
        .set('Content-Type', 'application/json; charset=utf-8')
        .send({
          query: `{
          evaluations:evaluationsFor(account: 189250 postalCode: "C1A 1N1") {
            yearBuilt
          }
        }`,
        })
      let { evaluations } = response.body.data
      expect(evaluations.yearBuilt).toEqual(1900)
    })
  })

  describe('dwellingsInFSA', () => {
    it('returns the dwellings in the given Forward Sortation Area', async () => {
      let server = new Server({
        client: collection,
      })

      let response = await request(server)
        .post('/graphql')
        .set('Content-Type', 'application/json; charset=utf-8')
        .send({
          query: `{
          dwellings:dwellingsInFSA(
           forwardSortationArea: "C1A"
          ) {
            yearBuilt
          }
        }`,
        })

      let { dwellings } = response.body.data
      expect(dwellings.length).toEqual(1)
    })
  })

  describe('dwellingsInFSA', () => {
    it('has a greater than filter which filters out dwellings', async () => {
      let server = new Server({
        client: collection,
      })

      let response = await request(server)
        .post('/graphql')
        .set('Content-Type', 'application/json; charset=utf-8')
        .send({
          query: `{
          dwellings:dwellingsInFSA(
           forwardSortationArea: "C1A"
           filter: {field: yearBuilt gt: "1900"}
          ) {
            yearBuilt
          }
        }`,
        })

      let { dwellings } = response.body.data
      expect(dwellings.length).toEqual(0)
    })

    it('complains about multiple comparators', async () => {
      let server = new Server({
        client: collection,
      })

      let response = await request(server)
        .post('/graphql')
        .set('Content-Type', 'application/json; charset=utf-8')
        .send({
          query: `{
          dwellingsInFSA(
           forwardSortationArea: "M8H"
           filter: {field: yearBuilt gt: "1979" lt: "1979"}
         ) {
          yearBuilt
        }
      }`,
        })
      expect(response.body).toHaveProperty('errors')
    })

    it('gets evalutations within a Forward Sortation Area', async () => {
      let server = new Server({
        client: collection,
      })

      let response = await request(server)
        .post('/graphql')
        .set('Content-Type', 'application/json; charset=utf-8')
        .send({
          query: `{
           dwellings:dwellingsInFSA(
             forwardSortationArea: "C1A"
           ) {
          yearBuilt
        }
      }`,
        })

      let { dwellings: [first] } = response.body.data
      expect(first.yearBuilt).toEqual(1900)
    })
  })
})