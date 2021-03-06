import { expect } from 'chai';
import nock from 'nock';
import KibanaClient from '../../../src/lib/KibanaClient';
import Samples from '../Samples';

describe('KibanaClient', () => {
    let config;
    let exampleHits;
    let exampleResponse;
    let exampleEntry;
    let client;

    beforeEach(() => {
        config = {
            url: 'http://myserver:9200',
            query: 'XYZ*'
        };
        exampleEntry = {
            key: 'value'
        };
        exampleHits = Samples.exampleHits();
        exampleResponse = {
            hits: {
                hits: exampleHits
            }
        };
        client = new KibanaClient(config);
    });

    it('should provide all config objects matching a query', () => {
        nock('http://myserver:9200').get('/.kibana/_search?size=1000&q=XYZ*').reply(200, exampleResponse);

        return client.findAll().then(hits => {
            expect(hits).to.deep.equal(exampleHits);
        });
    });

    it('should encode the query', () => {
        client.query = 'ÜÖÄ';
        nock('http://myserver:9200').get('/.kibana/_search?size=1000&q=%C3%9C%C3%96%C3%84').reply(200, exampleResponse);

        return client.findAll().then(hits => {
            expect(hits).to.deep.equal(exampleHits);
        });
    });

    it('should delete a given config object by type and id', () => {
        const request = nock('http://myserver:9200').delete('/.kibana/search/id1').reply(200);

        return client.delete('search', 'id1').then(() => {
            request.done();
        });
    });

    it('should upload a given config object', () => {
        const request = nock('http://myserver:9200')
            .put('/.kibana/search/id1', exampleEntry)
            .reply(200);

        return client.upload('search', 'id1', exampleEntry).then(() => {
            request.done();
        });
    });
});
