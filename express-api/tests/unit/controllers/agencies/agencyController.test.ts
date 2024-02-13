import { Request, Response } from 'express';
import controllers from '@/controllers';
import {
  MockReq,
  MockRes,
  getRequestHandlerMocks,
  produceAgency,
} from '../../../testUtils/factories';
import { Roles } from '@/constants/roles';
import { Agency } from '@/typeorm/Entities/Agency';
import { ErrorWithCode } from '@/utilities/customErrors/ErrorWithCode';

let mockRequest: Request & MockReq, mockResponse: Response & MockRes;

// const { getAgencies, addAgency, updateAgencyById, getAgencyById, deleteAgencyById } =
//   controllers.admin;

const _getAgencies = jest.fn().mockImplementation(() => [produceAgency()]);
const _postAgency = jest.fn().mockImplementation((agency) => agency);
const _getAgencyById = jest
  .fn()
  .mockImplementation((id: string) => ({ ...produceAgency(), Id: id }));
const _updateAgencyById = jest.fn().mockImplementation((agency) => agency);
const _deleteAgencyById = jest.fn().mockImplementation((id) => ({ ...produceAgency(), Id: id }));

jest.mock('@/services/agencies/agencyServices', () => ({
  getAgencies: () => _getAgencies(),
  postAgency: (_agency: Agency) => _postAgency(_agency),
  getAgencyById: (id: string) => _getAgencyById(id),
  updateAgencyById: (agency: Agency) => _updateAgencyById(agency),
  deleteAgencyById: (id: string) => _deleteAgencyById(id),
}));

const _getKeycloakUserRoles = jest.fn().mockImplementation(() => [{ name: Roles.ADMIN }]);

jest.mock('@/services/keycloak/keycloakService.ts', () => ({
  getKeycloakUserRoles: () => _getKeycloakUserRoles(),
}));

describe('UNIT - Agencies Admin', () => {
  beforeEach(() => {
    const { mockReq, mockRes } = getRequestHandlerMocks();
    mockRequest = mockReq;
    mockRequest.setUser({ client_roles: [Roles.ADMIN] });
    mockResponse = mockRes;
  });

  describe('Controller getAgencies', () => {
    // TODO: enable other tests when controller is complete
    it('should return status 200 and a list of agencies', async () => {
      await controllers.getAgencies(mockRequest, mockResponse);
      expect(mockResponse.statusValue).toBe(200);
    });

    it('should return status 200 and a list of agencies', async () => {
      mockRequest.query = {
        name: 'a',
        parentId: 'a',
        id: '1',
      };
      await controllers.getAgencies(mockRequest, mockResponse);
      expect(mockResponse.statusValue).toBe(200);
    });

    it('should return status 400', async () => {
      mockRequest.query = {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        name: 0 as any,
      };
      await controllers.getAgencies(mockRequest, mockResponse);
      expect(mockResponse.statusValue).toBe(400);
    });
  });

  describe('Controller addAgency', () => {
    it('should return status 201 and the new agency', async () => {
      const agency = produceAgency();
      mockRequest.body = agency;
      await controllers.addAgency(mockRequest, mockResponse);
      expect(mockResponse.statusValue).toBe(201);
      expect(mockResponse.sendValue.Id).toBe(agency.Id);
    });
    it('should return status 400', async () => {
      _postAgency.mockImplementationOnce(() => {
        throw new ErrorWithCode('', 400);
      });
      await controllers.addAgency(mockRequest, mockResponse);
      expect(mockResponse.statusValue).toBe(400);
    });
  });

  describe('Controller getAgencyById', () => {
    it('should return status 200 and the agency info', async () => {
      mockRequest.params.id = '777';
      await controllers.getAgencyById(mockRequest, mockResponse);
      expect(mockResponse.statusValue).toBe(200);
      expect(mockResponse.sendValue.Id).toBe(777);
    });
    it('should return status 400', async () => {
      _getAgencyById.mockImplementationOnce(() => {
        throw new ErrorWithCode('', 400);
      });
      await controllers.getAgencyById(mockRequest, mockResponse);
      expect(mockResponse.statusValue).toBe(400);
    });
    it('should return status 400', async () => {
      _getAgencyById.mockImplementationOnce(() => {
        throw new Error();
      });
      await controllers.getAgencyById(mockRequest, mockResponse);
      expect(mockResponse.statusValue).toBe(400);
    });
  });

  describe('Controller updateAgencyById', () => {
    it('should return status 200 and the updated agency', async () => {
      const agency = produceAgency();
      mockRequest.params.id = agency.Id.toString();
      mockRequest.body = agency;
      await controllers.updateAgencyById(mockRequest, mockResponse);
      expect(mockResponse.statusValue).toBe(200);
      expect(mockResponse.sendValue.Id).toBe(agency.Id);
    });
    it('should return status 400 and specify that there was a mismatch', async () => {
      const agency = produceAgency();
      mockRequest.params.id = 'asdf';
      mockRequest.body = agency;
      await controllers.updateAgencyById(mockRequest, mockResponse);
      expect(mockResponse.statusValue).toBe(400);
      expect(mockResponse.sendValue).toBe('The param ID does not match the request body.');
    });
    it('should return status 400', async () => {
      _updateAgencyById.mockImplementationOnce(() => {
        throw new ErrorWithCode('', 400);
      });
      const agency = produceAgency();
      mockRequest.params.id = agency.Id.toString();
      mockRequest.body = agency;
      await controllers.updateAgencyById(mockRequest, mockResponse);
      expect(mockResponse.statusValue).toBe(400);
    });
    it('should return status 400', async () => {
      _updateAgencyById.mockImplementationOnce(() => {
        throw new Error();
      });
      const agency = produceAgency();
      mockRequest.params.id = agency.Id.toString();
      mockRequest.body = agency;
      await controllers.updateAgencyById(mockRequest, mockResponse);
      expect(mockResponse.statusValue).toBe(400);
    });
  });

  describe('Controller deleteAgencyById', () => {
    it('should return status 200', async () => {
      const agency = produceAgency();
      mockRequest.params.id = agency.Id.toString();
      await controllers.deleteAgencyById(mockRequest, mockResponse);
      expect(mockResponse.statusValue).toBe(200);
      expect(mockResponse.sendValue.Id).toBe(agency.Id);
    });
    it('should return status 400', async () => {
      _deleteAgencyById.mockImplementationOnce(() => {
        throw new ErrorWithCode('', 400);
      });
      mockRequest.params.id = 'asf';
      await controllers.deleteAgencyById(mockRequest, mockResponse);
      expect(mockResponse.statusValue).toBe(400);
    });
    it('should return status 400', async () => {
      _deleteAgencyById.mockImplementationOnce(() => {
        throw new Error();
      });
      mockRequest.params.id = 'asf';
      await controllers.deleteAgencyById(mockRequest, mockResponse);
      expect(mockResponse.statusValue).toBe(400);
    });
  });
});