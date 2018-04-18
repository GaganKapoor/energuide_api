# Using the API!

## Introduction

This guide provides a quick overview on how to use the Graphql API to query open EnerGuide data. You
can find out more about Graphql at [graphql.org](https://graphql.org/).

All queries in this guide can be run at the [EnerGuide API Graphiql interface](http://energuideapi.ca/).
You're encouraged to test them out as you read along :tada:

You can find a list with descriptions of all the fields currently available to query in our
[API schema documentation](https://github.com/cds-snc/nrcan_api/blob/master/api/docs-en.md).

## Basic queries

There are two basic ways to query data:

1. Data about a specific dwelling, by providing a houseId in the query

```
query {
  dwelling(houseId:1420418)
}
```

2. Data about a set of dwellings

```
query {
  dwellings
}
```

You'll notice this query only returns a set of results, with `next` & `previous`
fields. Since the database contains a large amount of data, the API was built
to return a paginated set of results, which improves performance. There are
various ways to filter the results you receive, but more on that later!

**Important note:** For simplicity's sake, this guide uses queries that don't specify
return subfields. This works with the GraphiQL interface because it auto fills
subfields if none are specified, but when working with other interfaces or writing your
own, you will need to specify which subfields you want returned in your query. For example:

```
query {
  dwelling(houseId:1420418){
    yearBuilt
    evaluations {
      eghRating {
        measurement
        upgrade
      }
    }
  }
}
```

```
query {
  dwellings {
    results {
      yearBuilt
      evaluations {
        eghRating {
          measurement
          upgrade
        }
      }
    }
  }
}
```

## Fetch dwelling level data

By adding additional fields to your query, you can access data about a dwelling.
For example, if you wanted to access the `forward sortation area` and `year built`
of a specific dwelling, you would query the following:

```
query {
  dwelling(houseId:1420418) {
    yearBuilt
    forwardSortationArea
  }
}
```

For the multiple dwelling query, the data is stored in a `results` field. To
access it, you would query the following:

```
query {
  dwellings {
    results {
      yearBuilt
      forwardSortationArea
    }
  }
}
```

## Fetch evaluation level data

Evaluation data for dwellings can be accessed via the `evaluations` field. This
will return a list of evaluations for a dwelling (or dwellings), since a dwelling
can have multiple evaluations.

To access evaluation data, you would query the following:

Single dwelling:

```
query {
  dwelling(houseId:1420418) {
    evaluations
  }
}
```

Multiple dwellings:

```
query {
  dwellings {
    results {
      evaluations
    }
  }
}
```

You can also access specific evaluation fields in your query. For example if you
wanted to access `house type` and `green house gas emissions`:

Single dwelling:

```
query {
  dwelling(houseId:1420418) {
    evaluations {
      houseType
      greenhouseGasEmissions
    }
  }
}
```

Multiple dwellings:

```
query {
  dwellings {
    results {
      evaluations {
        houseType
        greenhouseGasEmissions
      }
    }
  }
}
```

You should now be able to access any field you want from the API :tada:

## Filters, Comparators, Limits & Pagination

The API includes filters to help narrow down data sets when querying for multiple
dwellings. You can chain multiple filters together to narrow down the results
as specifically as you would like. All filterable fields are documented in our
in our [API schema documentation](https://github.com/cds-snc/nrcan_api/blob/master/api/docs-en.md).

For example, if you want to retrieve the `eghRating` for dwellings in a specific `forward sortation area`, you
can query the following:

```
query {
  dwellings(filters:[{field:dwellingForwardSortationArea comparator:eq value:"V5V"}]) {
    results {
      forwardSortationArea
      evaluations {
        eghRating
      }
    }
  }
}
```

Lets say you want an even more specific set of data: the `eghRating` for all the `Single detached`
dwellings in a specific `forwardSortationArea`. You can add an additional filter to the original
query. Filters are always **AND**, never **OR**, which means you can query all the dwellings built in Ottawa in 1970,
but you can't query all dwellings built in Ottawa or Toronto in 1970 (you would have to split this query in two).

**Important note:**  All filters work by looking for at least one matching value and then returning a matching
dwelling with all of its data. This means that even if you're applying a filter specific to evaluations, you
will still receive dwellings that contain that evaluation, along with all the other evaluations belonging to that
dwelling. This behavior should be kept in mind when using the API.

```
query {
  dwellings(filters:[{field:dwellingForwardSortationArea comparator:eq value:"V5V"}, {field:evaluationHouseType comparator:eq value:"Single detached"}]) {
    results {
      forwardSortationArea
      evaluations {
        eghRating {
          measurement
          upgrade
        }
      }
    }
  }
}
```

The comparator flag allows you to specify how you want your filter applied. Specifically, we let you use:

* greater than (gt)
* equal to (eq)
* less than (lt)

All filter values need to be passed in as strings. For example, to filter by the year `1970`, you would pass it as:

`dwellings(filters:[{field:dwellingYearBuilt comparator:eq value:"1970"}])`

You can also limit the number of results returned by your query using the `limit` flag. For example, lets say you wanted to fetch the first 30 dwellings of the
last query:

```
query {
  dwellings(limit:30 filters:[{field:dwellingForwardSortationArea comparator:eq value:"V5V"}, {field:evaluationHouseType comparator:eq value:"Single detached"}]) {
    results {
      forwardSortationArea
      evaluations {
        eghRating {
          measurement
          upgrade
        }
      }
    }
  }
}
```

**Important note:** The limit applies to the dwellings returned, not evaluations. Since a dwelling can have multiple evaluations, you will likely receive more
than 30. The default limit set by the pagination is 50 dwellings. The maximum you can set the limit is 300 results.

If you want to access results from the next or previous set of paginated data, you can use the `next` or `previous` values from your query. For example if you query
the following:

```
query {
  dwellings {
    next
    results {
      forwardSortationArea
      evaluations {
        eghRating {
          measurement
          upgrade
        }
      }
    }
  }
}
```

You'll get a result back that looks something like this:

```
"data": {
  "dwellings": {
    "next": "eyIkb2lkIjoiNWFiZjIxZDhlZTUzZWE1MmFiZmJjMjU3In0",
    "results": [
      {
        "evaluations":
        ...
      }
   }
}
```

To query the next set of paginated data, take the value from the `next` field and plug it into the query. In this example,
it would look like this:

```
query {
  dwellings(next: "eyIkb2lkIjoiNWFiZjIxZDhlZTUzZWE1MmFiZmJjMjU3In0") {
    results {
      forwardSortationArea
      evaluations {
        eghRating {
          measurement
          upgrade
        }
      }
    }
  }
}
```

The results you receive will be for the next set of data.

Congratulations! Now you know how to filter, limit & navigate through your results :tada:

## Using the data with an application

There are a wide variety of ways to build applications that can talk to Graphql APIs! [How to Graphql](https://www.howtographql.com/) is a fantastic resource to check out. They provide a number of tutorials for building front end applications using data from a Graphql API. You can even learn how to build your own Graphql API if you're super keen.

## Have issues?

If you experience any issues with this guide, or using the API in general, please flag them in our [Github issues tracker](https://github.com/cds-snc/nrcan_api/issues).