import { seedDatabase } from '../../utils/seedData';

export function DatabaseSeeder() {
  const buttonStyle = {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    zIndex: 9999,
    padding: '10px 15px',
    backgroundColor: 'red',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontWeight: 'bold',
  };

  return (
    <button style={buttonStyle} onClick={seedDatabase}>
      ⚠️ Seed Database
    </button>
  );
}