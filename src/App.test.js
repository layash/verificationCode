import React, { act } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import VerificationForm from './components/verification';
import { MemoryRouter, useNavigate } from 'react-router-dom';

// Mock the fetch function
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ message: 'Success' })
  })
);

// Mock useNavigate
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn()
}));

const mockedUseNavigate = useNavigate;

describe('Verification Form', () => {
  test('renders the form correctly', () => {
    act(() => {
      render(
        <MemoryRouter>
          <VerificationForm />
        </MemoryRouter>
      );
    });

    expect(screen.getByText(/verification code:/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
  });

  test('inputs accept valid digits and move focus to next input', () => {
    act(() => {
      render(
        <MemoryRouter>
          <VerificationForm />
        </MemoryRouter>
      );
    });

    const inputs = screen.getAllByRole('textbox');
    fireEvent.change(inputs[0], { target: { value: '1' } });
    expect(inputs[0].value).toBe('1');
    expect(document.activeElement).toBe(inputs[1]);

    fireEvent.change(inputs[1], { target: { value: '2' } });
    expect(inputs[1].value).toBe('2');
    expect(document.activeElement).toBe(inputs[2]);
  });

  test('displays error message for invalid inputs', () => {
    act(() => {
      render(
        <MemoryRouter>
          <VerificationForm />
        </MemoryRouter>
      );
    });

    const button = screen.getByRole('button', { name: /submit/i });
    fireEvent.click(button);

    expect(screen.getByText(/all fields must be filled with valid digits/i)).toBeInTheDocument();
  });

  test('displays error message upon receiving an error response from the server', async () => {
    // Mock the fetch function to return an error
    global.fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ message: 'Verification Error' })
      })
    );

    await act(async () => {
      render(
        <MemoryRouter>
          <VerificationForm />
        </MemoryRouter>
      );
    });

    const inputs = screen.getAllByRole('textbox');
    inputs.forEach((input, index) => {
      fireEvent.change(input, { target: { value: `${index + 1}` } });
    });

    const button = screen.getByRole('button', { name: /submit/i });
    fireEvent.click(button);

    await waitFor(() =>
      expect(screen.getByText(/verification error/i)).toBeInTheDocument()
    );
  });

  test('redirects upon successful verification', async () => {
    // Mock the fetch function to return a success response
    global.fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ message: 'Success' })
      })
    );

    const navigateMock = jest.fn();
    mockedUseNavigate.mockReturnValue(navigateMock);

    await act(async () => {
      render(
        <MemoryRouter>
          <VerificationForm />
        </MemoryRouter>
      );
    });

    const inputs = screen.getAllByRole('textbox');
    inputs.forEach((input, index) => {
      fireEvent.change(input, { target: { value: `${index + 1}` } });
    });

    const button = screen.getByRole('button', { name: /submit/i });
    fireEvent.click(button);

    await waitFor(() => expect(navigateMock).toHaveBeenCalledWith('/success'));
  });
});
