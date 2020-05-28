import PropertyListView from './PropertyListView';
import React from 'react';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import { render } from '@testing-library/react';
import renderer from 'react-test-renderer';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { ILookupCode } from 'actions/lookupActions';
import * as API from 'constants/API';
import { Provider } from 'react-redux';
import * as reducerTypes from 'constants/reducerTypes';
import service from '../service';

// Set all module functions to jest.fn
jest.mock('../service');
const mockedService = service as jest.Mocked<typeof service>;

const mockStore = configureMockStore([thunk]);

const lCodes = {
  lookupCodes: [
    { name: 'agencyVal', id: '1', isDisabled: false, type: API.AGENCY_CODE_SET_NAME },
    {
      name: 'classificationVal',
      id: '1',
      isDisabled: false,
      type: API.PROPERTY_CLASSIFICATION_CODE_SET_NAME,
    },
  ] as ILookupCode[],
};

const store = mockStore({
  [reducerTypes.LOOKUP_CODE]: lCodes,
});

const history = createMemoryHistory();

describe('Property list view', () => {
  // clear mocks before each test
  beforeEach(() => {
    mockedService.getPropertyList.mockClear();
    mockedService.getPropertyReport.mockClear();
  });

  it('Matches snapshot', () => {
    // API "returns" no results
    mockedService.getPropertyList.mockResolvedValueOnce({
      quantity: 0,
      total: 0,
      page: 1,
      pageIndex: 0,
      items: [],
    });

    const tree = renderer
      .create(
        <Provider store={store}>
          <PropertyListView />,
        </Provider>,
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('Displays message for empty list', async () => {
    mockedService.getPropertyList.mockResolvedValueOnce({
      quantity: 0,
      total: 0,
      page: 1,
      pageIndex: 0,
      items: [],
    });

    const { findByText } = render(
      <Provider store={store}>
        <Router history={history}>
          <PropertyListView />
        </Router>
      </Provider>,
    );

    // default table message when there is no data to display
    const noResults = await findByText(/No rows to display/i);
    expect(noResults).toBeInTheDocument();
  });

  it('Displays link to property details page', async () => {
    const fakeId = 1;
    mockedService.getPropertyList.mockResolvedValueOnce({
      quantity: 10,
      total: 2,
      page: 1,
      pageIndex: 0,
      items: [
        {
          id: fakeId,
          propertyTypeId: 0,
          pid: '029-539-145',
          statusId: 1,
          status: 'Active',
          classificationId: 0,
          classification: 'Core Operational',
          latitude: 50.1256825265,
          longitude: -120.768029645,
          description: 'Traditional site',
          isSensitive: false,
          agencyId: 19,
          agency: 'Ministry of Advanced Education, Skills \u0026 Training',
          agencyCode: 'AEST',
          subAgency: 'Nichola Valley Institute of Technology',
          subAgencyCode: 'NVIOT',
          addressId: 1,
          address: '4155 Belshaw St',
          city: 'Merritt',
          province: 'British Columbia',
          postal: 'V1K1R1',
          estimated: 0.0,
          netBook: 0.0,
          assessed: 958000.0,
          assessedDate: '2018-01-01T00:00:00',
          appraised: 0.0,
          landArea: 26.9,
          landLegalDescription:
            'LOT A SECTION 22 TOWNSHIP 91 KAMLOOPS DIVISION YALE DISTRICT PLAN EPP50042',
          constructionTypeId: 0,
          predominateUseId: 0,
          occupantTypeId: 0,
          floorCount: 0,
          transferLeaseOnSale: false,
          rentableArea: 0,
        },
        {
          id: 5,
          propertyTypeId: 1,
          pid: '029-539-145',
          statusId: 1,
          status: 'Active',
          classificationId: 0,
          classification: 'Core Operational',
          latitude: 50.1243991,
          longitude: -120.7662049,
          description: 'Student Residence',
          isSensitive: false,
          agencyId: 19,
          agency: 'Ministry of Advanced Education, Skills \u0026 Training',
          agencyCode: 'AEST',
          subAgency: 'Nichola Valley Institute of Technology',
          subAgencyCode: 'NVIOT',
          addressId: 6,
          address: '4155 Belshaw St',
          city: 'Merritt',
          province: 'British Columbia',
          postal: 'V1K1R1',
          estimated: 0.0,
          netBook: 0.0,
          assessed: 958000.0,
          assessedDate: '2018-01-01T00:00:00',
          appraised: 0.0,
          landArea: 26.9,
          landLegalDescription:
            'LOT A SECTION 22 TOWNSHIP 91 KAMLOOPS DIVISION YALE DISTRICT PLAN EPP50042',
          localId: 'Residence B',
          parcelId: fakeId,
          constructionTypeId: 2,
          constructionType: 'Mixed',
          predominateUseId: 19,
          predominateUse: 'Dormitory/Residence Halls',
          occupantTypeId: 0,
          occupantType: 'Leased',
          floorCount: 3,
          tenancy: '100% Rental',
          transferLeaseOnSale: false,
          rentableArea: 0,
        },
      ],
    });

    const { findAllByRole } = render(
      <Provider store={store}>
        <Router history={history}>
          <PropertyListView />
        </Router>
      </Provider>,
    );

    // assert we got a table with two rows and links to the details page
    const links = await findAllByRole('link');
    expect(links).toHaveLength(2);
    expect(links[0]).toHaveAttribute('href', `/submitProperty/${fakeId}?disabled=true`);
  });
});