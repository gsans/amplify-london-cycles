/* tslint:disable */
//  This file was automatically generated and should not be edited.
import { Injectable } from "@angular/core";
import API, { graphqlOperation } from "@aws-amplify/api";
import { GraphQLResult } from "@aws-amplify/api/lib/types";
import * as Observable from "zen-observable";

export type CreateBikePointInput = {
  id?: string | null;
  name: string;
  description?: string | null;
  location?: LocationInput | null;
  bikes?: number | null;
};

export type LocationInput = {
  lat?: number | null;
  lon?: number | null;
};

export type ModelBikePointConditionInput = {
  name?: ModelStringInput | null;
  description?: ModelStringInput | null;
  bikes?: ModelIntInput | null;
  and?: Array<ModelBikePointConditionInput | null> | null;
  or?: Array<ModelBikePointConditionInput | null> | null;
  not?: ModelBikePointConditionInput | null;
};

export type ModelStringInput = {
  ne?: string | null;
  eq?: string | null;
  le?: string | null;
  lt?: string | null;
  ge?: string | null;
  gt?: string | null;
  contains?: string | null;
  notContains?: string | null;
  between?: Array<string | null> | null;
  beginsWith?: string | null;
  attributeExists?: boolean | null;
  attributeType?: ModelAttributeTypes | null;
  size?: ModelSizeInput | null;
};

export enum ModelAttributeTypes {
  binary = "binary",
  binarySet = "binarySet",
  bool = "bool",
  list = "list",
  map = "map",
  number = "number",
  numberSet = "numberSet",
  string = "string",
  stringSet = "stringSet",
  _null = "_null"
}

export type ModelSizeInput = {
  ne?: number | null;
  eq?: number | null;
  le?: number | null;
  lt?: number | null;
  ge?: number | null;
  gt?: number | null;
  between?: Array<number | null> | null;
};

export type ModelIntInput = {
  ne?: number | null;
  eq?: number | null;
  le?: number | null;
  lt?: number | null;
  ge?: number | null;
  gt?: number | null;
  between?: Array<number | null> | null;
  attributeExists?: boolean | null;
  attributeType?: ModelAttributeTypes | null;
};

export type UpdateBikePointInput = {
  id: string;
  name?: string | null;
  description?: string | null;
  location?: LocationInput | null;
  bikes?: number | null;
};

export type DeleteBikePointInput = {
  id?: string | null;
};

export type ModelBikePointFilterInput = {
  id?: ModelIDInput | null;
  name?: ModelStringInput | null;
  description?: ModelStringInput | null;
  bikes?: ModelIntInput | null;
  and?: Array<ModelBikePointFilterInput | null> | null;
  or?: Array<ModelBikePointFilterInput | null> | null;
  not?: ModelBikePointFilterInput | null;
};

export type ModelIDInput = {
  ne?: string | null;
  eq?: string | null;
  le?: string | null;
  lt?: string | null;
  ge?: string | null;
  gt?: string | null;
  contains?: string | null;
  notContains?: string | null;
  between?: Array<string | null> | null;
  beginsWith?: string | null;
  attributeExists?: boolean | null;
  attributeType?: ModelAttributeTypes | null;
  size?: ModelSizeInput | null;
};

export type SearchableBikePointFilterInput = {
  id?: SearchableIDFilterInput | null;
  name?: SearchableStringFilterInput | null;
  description?: SearchableStringFilterInput | null;
  bikes?: SearchableIntFilterInput | null;
  and?: Array<SearchableBikePointFilterInput | null> | null;
  or?: Array<SearchableBikePointFilterInput | null> | null;
  not?: SearchableBikePointFilterInput | null;
};

export type SearchableIDFilterInput = {
  ne?: string | null;
  eq?: string | null;
  match?: string | null;
  matchPhrase?: string | null;
  matchPhrasePrefix?: string | null;
  multiMatch?: string | null;
  exists?: boolean | null;
  wildcard?: string | null;
  regexp?: string | null;
};

export type SearchableStringFilterInput = {
  ne?: string | null;
  eq?: string | null;
  match?: string | null;
  matchPhrase?: string | null;
  matchPhrasePrefix?: string | null;
  multiMatch?: string | null;
  exists?: boolean | null;
  wildcard?: string | null;
  regexp?: string | null;
};

export type SearchableIntFilterInput = {
  ne?: number | null;
  gt?: number | null;
  lt?: number | null;
  gte?: number | null;
  lte?: number | null;
  eq?: number | null;
  range?: Array<number | null> | null;
};

export type SearchableBikePointSortInput = {
  field?: SearchableBikePointSortableFields | null;
  direction?: SearchableSortDirection | null;
};

export enum SearchableBikePointSortableFields {
  id = "id",
  name = "name",
  description = "description",
  bikes = "bikes"
}

export enum SearchableSortDirection {
  asc = "asc",
  desc = "desc"
}

export type CreateBikePointMutation = {
  __typename: "BikePoint";
  id: string;
  name: string;
  description: string | null;
  location: {
    __typename: "Location";
    lat: number | null;
    lon: number | null;
  } | null;
  bikes: number | null;
};

export type UpdateBikePointMutation = {
  __typename: "BikePoint";
  id: string;
  name: string;
  description: string | null;
  location: {
    __typename: "Location";
    lat: number | null;
    lon: number | null;
  } | null;
  bikes: number | null;
};

export type DeleteBikePointMutation = {
  __typename: "BikePoint";
  id: string;
  name: string;
  description: string | null;
  location: {
    __typename: "Location";
    lat: number | null;
    lon: number | null;
  } | null;
  bikes: number | null;
};

export type NearbyBikeStationsQuery = {
  __typename: "ModelBikePointConnection";
  items: Array<{
    __typename: "BikePoint";
    id: string;
    name: string;
    description: string | null;
    location: {
      __typename: "Location";
      lat: number | null;
      lon: number | null;
    } | null;
    bikes: number | null;
  } | null> | null;
  total: number | null;
  nextToken: string | null;
};

export type GetBikePointQuery = {
  __typename: "BikePoint";
  id: string;
  name: string;
  description: string | null;
  location: {
    __typename: "Location";
    lat: number | null;
    lon: number | null;
  } | null;
  bikes: number | null;
};

export type ListBikePointsQuery = {
  __typename: "ModelBikePointConnection";
  items: Array<{
    __typename: "BikePoint";
    id: string;
    name: string;
    description: string | null;
    location: {
      __typename: "Location";
      lat: number | null;
      lon: number | null;
    } | null;
    bikes: number | null;
  } | null> | null;
  total: number | null;
  nextToken: string | null;
};

export type SearchBikePointsQuery = {
  __typename: "SearchableBikePointConnection";
  items: Array<{
    __typename: "BikePoint";
    id: string;
    name: string;
    description: string | null;
    location: {
      __typename: "Location";
      lat: number | null;
      lon: number | null;
    } | null;
    bikes: number | null;
  } | null> | null;
  nextToken: string | null;
  total: number | null;
};

export type OnCreateBikePointSubscription = {
  __typename: "BikePoint";
  id: string;
  name: string;
  description: string | null;
  location: {
    __typename: "Location";
    lat: number | null;
    lon: number | null;
  } | null;
  bikes: number | null;
};

export type OnUpdateBikePointSubscription = {
  __typename: "BikePoint";
  id: string;
  name: string;
  description: string | null;
  location: {
    __typename: "Location";
    lat: number | null;
    lon: number | null;
  } | null;
  bikes: number | null;
};

export type OnDeleteBikePointSubscription = {
  __typename: "BikePoint";
  id: string;
  name: string;
  description: string | null;
  location: {
    __typename: "Location";
    lat: number | null;
    lon: number | null;
  } | null;
  bikes: number | null;
};

@Injectable({
  providedIn: "root"
})
export class APIService {
  async CreateBikePoint(
    input: CreateBikePointInput,
    condition?: ModelBikePointConditionInput
  ): Promise<CreateBikePointMutation> {
    const statement = `mutation CreateBikePoint($input: CreateBikePointInput!, $condition: ModelBikePointConditionInput) {
        createBikePoint(input: $input, condition: $condition) {
          __typename
          id
          name
          description
          location {
            __typename
            lat
            lon
          }
          bikes
        }
      }`;
    const gqlAPIServiceArguments: any = {
      input
    };
    if (condition) {
      gqlAPIServiceArguments.condition = condition;
    }
    const response = (await API.graphql(
      graphqlOperation(statement, gqlAPIServiceArguments)
    )) as any;
    return <CreateBikePointMutation>response.data.createBikePoint;
  }
  async UpdateBikePoint(
    input: UpdateBikePointInput,
    condition?: ModelBikePointConditionInput
  ): Promise<UpdateBikePointMutation> {
    const statement = `mutation UpdateBikePoint($input: UpdateBikePointInput!, $condition: ModelBikePointConditionInput) {
        updateBikePoint(input: $input, condition: $condition) {
          __typename
          id
          name
          description
          location {
            __typename
            lat
            lon
          }
          bikes
        }
      }`;
    const gqlAPIServiceArguments: any = {
      input
    };
    if (condition) {
      gqlAPIServiceArguments.condition = condition;
    }
    const response = (await API.graphql(
      graphqlOperation(statement, gqlAPIServiceArguments)
    )) as any;
    return <UpdateBikePointMutation>response.data.updateBikePoint;
  }
  async DeleteBikePoint(
    input: DeleteBikePointInput,
    condition?: ModelBikePointConditionInput
  ): Promise<DeleteBikePointMutation> {
    const statement = `mutation DeleteBikePoint($input: DeleteBikePointInput!, $condition: ModelBikePointConditionInput) {
        deleteBikePoint(input: $input, condition: $condition) {
          __typename
          id
          name
          description
          location {
            __typename
            lat
            lon
          }
          bikes
        }
      }`;
    const gqlAPIServiceArguments: any = {
      input
    };
    if (condition) {
      gqlAPIServiceArguments.condition = condition;
    }
    const response = (await API.graphql(
      graphqlOperation(statement, gqlAPIServiceArguments)
    )) as any;
    return <DeleteBikePointMutation>response.data.deleteBikePoint;
  }
  async NearbyBikeStations(
    location: LocationInput,
    m?: number
  ): Promise<NearbyBikeStationsQuery> {
    const statement = `query NearbyBikeStations($location: LocationInput!, $m: Int) {
        nearbyBikeStations(location: $location, m: $m) {
          __typename
          items {
            __typename
            id
            name
            description
            location {
              __typename
              lat
              lon
            }
            bikes
          }
          total
          nextToken
        }
      }`;
    const gqlAPIServiceArguments: any = {
      location
    };
    if (m) {
      gqlAPIServiceArguments.m = m;
    }
    const response = (await API.graphql(
      graphqlOperation(statement, gqlAPIServiceArguments)
    )) as any;
    return <NearbyBikeStationsQuery>response.data.nearbyBikeStations;
  }
  async GetBikePoint(id: string): Promise<GetBikePointQuery> {
    const statement = `query GetBikePoint($id: ID!) {
        getBikePoint(id: $id) {
          __typename
          id
          name
          description
          location {
            __typename
            lat
            lon
          }
          bikes
        }
      }`;
    const gqlAPIServiceArguments: any = {
      id
    };
    const response = (await API.graphql(
      graphqlOperation(statement, gqlAPIServiceArguments)
    )) as any;
    return <GetBikePointQuery>response.data.getBikePoint;
  }
  async ListBikePoints(
    filter?: ModelBikePointFilterInput,
    limit?: number,
    nextToken?: string
  ): Promise<ListBikePointsQuery> {
    const statement = `query ListBikePoints($filter: ModelBikePointFilterInput, $limit: Int, $nextToken: String) {
        listBikePoints(filter: $filter, limit: $limit, nextToken: $nextToken) {
          __typename
          items {
            __typename
            id
            name
            description
            location {
              __typename
              lat
              lon
            }
            bikes
          }
          total
          nextToken
        }
      }`;
    const gqlAPIServiceArguments: any = {};
    if (filter) {
      gqlAPIServiceArguments.filter = filter;
    }
    if (limit) {
      gqlAPIServiceArguments.limit = limit;
    }
    if (nextToken) {
      gqlAPIServiceArguments.nextToken = nextToken;
    }
    const response = (await API.graphql(
      graphqlOperation(statement, gqlAPIServiceArguments)
    )) as any;
    return <ListBikePointsQuery>response.data.listBikePoints;
  }
  async SearchBikePoints(
    filter?: SearchableBikePointFilterInput,
    sort?: SearchableBikePointSortInput,
    limit?: number,
    nextToken?: string
  ): Promise<SearchBikePointsQuery> {
    const statement = `query SearchBikePoints($filter: SearchableBikePointFilterInput, $sort: SearchableBikePointSortInput, $limit: Int, $nextToken: String) {
        searchBikePoints(filter: $filter, sort: $sort, limit: $limit, nextToken: $nextToken) {
          __typename
          items {
            __typename
            id
            name
            description
            location {
              __typename
              lat
              lon
            }
            bikes
          }
          nextToken
          total
        }
      }`;
    const gqlAPIServiceArguments: any = {};
    if (filter) {
      gqlAPIServiceArguments.filter = filter;
    }
    if (sort) {
      gqlAPIServiceArguments.sort = sort;
    }
    if (limit) {
      gqlAPIServiceArguments.limit = limit;
    }
    if (nextToken) {
      gqlAPIServiceArguments.nextToken = nextToken;
    }
    const response = (await API.graphql(
      graphqlOperation(statement, gqlAPIServiceArguments)
    )) as any;
    return <SearchBikePointsQuery>response.data.searchBikePoints;
  }
  OnCreateBikePointListener: Observable<
    OnCreateBikePointSubscription
  > = API.graphql(
    graphqlOperation(
      `subscription OnCreateBikePoint {
        onCreateBikePoint {
          __typename
          id
          name
          description
          location {
            __typename
            lat
            lon
          }
          bikes
        }
      }`
    )
  ) as Observable<OnCreateBikePointSubscription>;

  OnUpdateBikePointListener: Observable<
    OnUpdateBikePointSubscription
  > = API.graphql(
    graphqlOperation(
      `subscription OnUpdateBikePoint {
        onUpdateBikePoint {
          __typename
          id
          name
          description
          location {
            __typename
            lat
            lon
          }
          bikes
        }
      }`
    )
  ) as Observable<OnUpdateBikePointSubscription>;

  OnDeleteBikePointListener: Observable<
    OnDeleteBikePointSubscription
  > = API.graphql(
    graphqlOperation(
      `subscription OnDeleteBikePoint {
        onDeleteBikePoint {
          __typename
          id
          name
          description
          location {
            __typename
            lat
            lon
          }
          bikes
        }
      }`
    )
  ) as Observable<OnDeleteBikePointSubscription>;
}
