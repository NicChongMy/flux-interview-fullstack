import classnames from 'classnames'
import { useContext, useState } from 'react'
import { MatrixTableContext, MatrixTableContextProvider } from './context'
import _ from 'lodash';

type Props = {
  initialMatrix?: import('../../types').Matrix
} & import('react').HTMLAttributes<HTMLDivElement>

/**
 * Add 4 buttons: 
 * - Cancel to reset the matrix to how it was before changing the values (only when in edit mode)
 * - Edit to make the fields editable (only when not in edit mode)
 * - Clear to completely clear the table
 * - Save to save the table
 * @param param0 
 */
const MatrixTable: import('react').FC<Omit<Props, 'initialMatrix'>> = ({ className, children, ...props }) => {
  // State ------------------------------------------------------------------- //
  const [{ matrix }, dispatch] = useContext(MatrixTableContext)

  // Temporary State for fetched data 
  const initialFetchedDataState = { isFetched: false };
  const [fetchedData, setFetchedDataState] = useState(initialFetchedDataState);

  // Temporary State for edit mode
  const initialState = { isEditMode: false, currentMode: '' };
  const [state, setState] = useState(initialState);

  //Temporary memory for originalMatrix
  const initialDataFromAPI = { dataObj: {} }
  const [initialData, setInitialData] = useState(initialDataFromAPI);

  // Handlers ---------------------------------------------------------------- //
  // Get latest data from pricing.json or defaultPricing json
  const fetchDataFromAPI = async () => {
    fetch('http://localhost:3000/api/pricing').then(res => res.json())
      .then((data) => {
        //Temporary memory for originalMatrix
        setInitialData({ dataObj: data });
        dispatch({
          type: 'SET_ORIGINAL_MATRIX',
          payload: data
        })
      });

    setFetchedDataState({ isFetched: true });
  }

  // Function to save matrix table to public/pricing.json
  const save = async () => {
    let newMatrixValue = matrix;

    fetch('http://localhost:3000/api/save-pricing', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newMatrixValue)
    }).then(response => response.json())
      .then((data) => {
        alert('Successfully saved to public/pricing.json');
        setState({ isEditMode: false, currentMode: "SAVE" });
        // Set latest data to Temporary memory for originalMatrix
        setInitialData({ dataObj: newMatrixValue });
      }).catch(err => {
        console.log("Error saving data " + err);
      });
  }

  // Function to reset matrix table to original data from API
  const cancel = async () => {
    setState({ isEditMode: false, currentMode: "CANCEL" });
    dispatch({
      type: 'SET_ORIGINAL_MATRIX',
      payload: (initialData.dataObj as any)
    })
  }

  // Function to clear matrix table to zero
  const clear = async () => {
    setState({ isEditMode: true, currentMode: "CLEAR" });
    dispatch({
      type: 'SET_MATRIX',
      metadata: { resetToEmpty: true }
    })
  }

  // Function to enable edit mode
  const edit = async () => {
    setState({ isEditMode: !state.isEditMode, currentMode: "EDIT" });
  }

  /* Function to calculate price for each package
   * @param e 
   * @param mth - 36months, 24months, 12months
   * @param pkg - lite, standard, unlimited
   */
  function onInputChange(e, mth, pkg) {
    const inputName = e.target.name;
    const value = e.target.value == '' ? 0 : e.target.value;
    if (Number(value) || value == 0) {
      let newMatrixValue = _.cloneDeep(initialData.dataObj);

      if (pkg == "lite") {
        newMatrixValue[mth].lite = Number(value);
        newMatrixValue[mth].standard = Number(value) * 2;
        newMatrixValue[mth].unlimited = Number(value) * 3;
      } else if (pkg == "standard") {
        newMatrixValue[mth].standard = Number(value);
      } if (pkg == "unlimited") {
        newMatrixValue[mth].unlimited = Number(value);
      }

      dispatch({
        type: 'SET_MATRIX',
        payload: (newMatrixValue as any)
      })

    } else {
      alert('Only numbers allowed.')
    }
  }

  // Rendering --------------------------------------------------------------- //
  return (
    <div className={classnames(['container', className])} {...props}>
      {/* If state isFetched is false, display button to fetch data from api manually */}
      {!fetchedData.isFetched ? <button onClick={fetchDataFromAPI}>Fetch data from API</button> : null}
      {/* If state isFetched is true, display matrix table */}
      {fetchedData.isFetched ? <div>

        <form>
          <table className={classnames(['matrix-table', className])}>
            <thead>
              <tr>
                <th className={classnames(['table-col-width', className])}></th>
                <th className={classnames(['table-col-width', className])}>Lite</th>
                <th className={classnames(['table-col-width', className])}>Standard</th>
                <th className={classnames(['table-col-width', className])}>Unlimited</th>
              </tr>
            </thead>
            {/* If state isEditMode is false, display read-only matrix table */}
            {!state.isEditMode ? <tbody>
              <tr>
                <td>36 months</td>
                <td className={classnames(['table-col-data', className])}>{matrix["36months"].lite}</td>
                <td className={classnames(['table-col-data', className])}>{matrix["36months"].standard}</td>
                <td className={classnames(['table-col-data', className])}>{matrix["36months"].unlimited}</td>
              </tr>
              <tr>
                <td>24 months</td>
                <td className={classnames(['table-col-data', className])}>{matrix["24months"].lite}</td>
                <td className={classnames(['table-col-data', className])}>{matrix["24months"].standard}</td>
                <td className={classnames(['table-col-data', className])}>{matrix["24months"].unlimited}</td>
              </tr>
              <tr>
                <td>12 months</td>
                <td className={classnames(['table-col-data', className])}>{matrix["12months"].lite}</td>
                <td className={classnames(['table-col-data', className])}>{matrix["12months"].standard}</td>
                <td className={classnames(['table-col-data', className])}>{matrix["12months"].unlimited}</td>
              </tr>
            </tbody> : null}
            {/* If state isEditMode is true, display matrix table with input */}
            {state.isEditMode ? <tbody>
              <tr>
                <td>36 months</td>
                <td className={classnames(['table-col-data', className])}><input
                  value={matrix["36months"].lite || 0}
                  onChange={(e) => onInputChange(e, '36months', 'lite')} /></td>
                <td className={classnames(['table-col-data', className])}><input
                  value={matrix["36months"].standard || 0}
                  onChange={(e) => onInputChange(e, '36months', 'standard')} /></td>
                <td className={classnames(['table-col-data', className])}><input
                  value={matrix["36months"].unlimited || 0}
                  onChange={(e) => onInputChange(e, '36months', 'unlimited')} /></td>
              </tr>
              <tr>
                <td>24 months</td>
                <td className={classnames(['table-col-data', className])}><input
                  value={matrix["24months"].lite || 0}
                  onChange={(e) => onInputChange(e, '24months', 'lite')} /></td>
                <td className={classnames(['table-col-data', className])}><input
                  value={matrix["24months"].standard || 0}
                  onChange={(e) => onInputChange(e, '24months', 'standard')} /></td>
                <td className={classnames(['table-col-data', className])}><input
                  value={matrix["24months"].unlimited || 0}
                  onChange={(e) => onInputChange(e, '24months', 'unlimited')} /></td>
              </tr>
              <tr>
                <td>12 months</td>
                <td className={classnames(['table-col-data', className])}><input
                  value={matrix["12months"].lite || 0}
                  onChange={(e) => onInputChange(e, '12months', 'lite')} /></td>
                <td className={classnames(['table-col-data', className])}><input
                  value={matrix["12months"].standard || 0}
                  onChange={(e) => onInputChange(e, '12months', 'standard')} /></td>
                <td className={classnames(['table-col-data', className])}><input
                  value={matrix["12months"].unlimited || 0}
                  onChange={(e) => onInputChange(e, '12months', 'unlimited')} /></td>
              </tr>
            </tbody> : null}

          </table>
        </form>

        <br />
        {/* Display friendly notification after button click */}
        {state.currentMode == 'CANCEL' ? <div>We reset your matrix table to the original matrix from API</div> : null}
        {state.currentMode == 'CLEAR' ? <div>We reset your matrix table to the empty matrix</div> : null}
        <br />


        {/* Only display edit button when is not under edit mode */}
        {!state.isEditMode ? <button onClick={edit}>Edit</button> : null}
        {/* Display save, clear, cancel button when is under edit mode */}
        {state.isEditMode ? <div><button onClick={save}>Save</button><button onClick={clear}>Clear</button><button onClick={cancel}>Reset / Cancel</button></div> : null}

        <br />
        <br />

      </div> : null}


      <style jsx>{`
        .container {
          width:80vw;
        }

        .matrix-table{
          width:100%;
        }

        .table-col-width{
          width:25%;
        }

        .table-col-data{
          text-align:center;
        }
      `}</style>
    </div>

  )
}

const MatrixTableWithContext: import('react').FC<Props> = ({ initialMatrix, ...props }) => {
  // You can fetch the pricing here or in pages/index.ts
  // Remember that you should try to reflect the state of pricing in originalMatrix.
  // matrix will hold the latest value (edited or same as originalMatrix)


  return (
    <MatrixTableContextProvider initialMatrix={initialMatrix}>
      <MatrixTable {...props} />
    </MatrixTableContextProvider>
  )

}

export default MatrixTableWithContext
