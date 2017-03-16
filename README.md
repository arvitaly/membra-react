# membra-react

Binding for Membra (https://github.com/arvitaly/membra) and React

[![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][daviddm-image]][daviddm-url] [![Coverage percentage][coveralls-image]][coveralls-url]
[![experimental](http://badges.github.io/stability-badges/dist/experimental.svg)](http://github.com/badges/stability-badges)

# Install

    npm install membra-react --save

# Usage

For usage we need GraphQL-client, who implements membra-interface and query-parser from Membra

    import {IMembraClient, QueryParser} from "membra";
    const client: IMembraClient; // need implementation
    const schema; // need GraphQLSchema
    /*
        Example:
        import { buildClientSchema } from "graphql";
        const jsonSchema = require("./schema.json"); // Schema from server
        schema = buildClientSchema(schema.data);
    */
    /*
        Or:
        import {GraphQLSchema} from "graphql";
        schema = new GraphQLSchema(...);
    */
    const parser = new QueryParser(schema);

    const query = parser.parse`
        query Q1($id:String){
            node(id:$id){
                ...F1
            }
            fragment F1 on User{
                name
            }
        }`;

    <Container
        query={query}
        vars={{id: "1"}}
        client={client}
        renderFetched={(data)=>{
            return <h1>Name: {data.node.name}</h1>;
        }}
    />


# API



# Test

    npm install
    npm test

[npm-image]: https://badge.fury.io/js/membra-react.svg
[npm-url]: https://npmjs.org/package/membra-react
[travis-image]: https://travis-ci.org/arvitaly/membra-react.svg?branch=master
[travis-url]: https://travis-ci.org/arvitaly/membra-react
[daviddm-image]: https://david-dm.org/arvitaly/membra-react.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/arvitaly/membra-react
[coveralls-image]: https://coveralls.io/repos/arvitaly/membra-react/badge.svg
[coveralls-url]: https://coveralls.io/r/arvitaly/membra-react