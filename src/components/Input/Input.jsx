import './InputStyle.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; 

const Input = ({tipo, textoInterno, hacer, icono}) => {
  return (
    <>
      <span className='input-final flex-row-center'>
      <FontAwesomeIcon icon={icono} className='icono-input-login'/>
      <input className="input-principal" type={tipo} placeholder={textoInterno} onChange={hacer} />
      </span>
    </>
  )
}

export default Input