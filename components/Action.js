import Spacer from "@components/Spacer"; // Component: Spacer
import Selector from "@components/Selector"; // Component: Selector
import { useEffect, useState } from "react"; // Local state management
import { VEX_ACTIONS } from "@utils/constants"; // Constants
import styles from "@styles/components/Action.module.scss"; // Component styles
import { ActionInputWithSideLabel } from "@components/Inputs"; // Components: Inputs

export default function Action({ onChangeHandler, index }) {
  // Local state containers
  const [func, setFunc] = useState(null);
  const [values, setValues] = useState([]);
  const [args, setArgs] = useState([]);
  const [contract, setContract] = useState(null);

  /**
   * Clears all children at current depth - 1
   * @param {Boolean} contractCleared if clearing contract, else clearing function layer
   */
  const clearChildren = (contractCleared) => {
    // If clearing at contract layer
    if (contractCleared) {
      // Nullify function
      setFunc(null);
    }

    // Else, nullify arguments and values
    setArgs([]);
    setValues([]);
  };

  /**
   * Prefill arrays on function selection
   */
  const updateArgsAndValues = () => {
    // Collect function
    const funcOptions =
      VEX_ACTIONS[contract.value.key].functions[func.value.key];

    // Prefill arrays based on function params
    setArgs(new Array(funcOptions.args.length).fill(""));
    setValues(new Array(funcOptions.values.length).fill(""));
  };

  /**
   * Update args array at index
   * @param {String} value to update
   * @param {Number} index to update at
   */
  const updateArgsAtIndex = (value, index) => {
    let temp = args;
    temp[index] = value;
    setArgs([...temp]);
  };

  /**
   * Update values array at index
   * @param {String} value to update
   * @param {Number} index to update at
   */
  const updateValuesAtIndex = (value, index) => {
    let temp = values;
    temp[index] = value;
    setValues([...temp]);
  };

  /**
   * Updates state of parent action array
   */
  const updateParentState = () => {
    onChangeHandler(
      [
        // Contract address if selected or null
        contract ? contract.value.address : null,
        // Function signature if selected or null
        func ? func.value.signature : null,
        // Args array
        args,
        // Values array
        values,
      ],
      index
    );
  };

  // Clear all children when contract value changes
  useEffect(() => clearChildren(true), [contract]);
  // On function update
  useEffect(() => {
    // Clear all arg/value children
    clearChildren(false);

    // If not null
    if (func) {
      // Also prefill args and values arrays
      updateArgsAndValues();
    }
  }, [func]);

  // Update state of parent container on any change
  useEffect(updateParentState, [contract, func, args, values]);

  return (
    <div className={styles.action}>
      {/* Action label */}
      <label>Action #{index + 1}</label>

      {/* Contract selector */}
      <Spacer height="12" />
      <Selector
        value={contract}
        onChangeHandler={setContract}
        placeholder="Select contract..."
        // Filter all actions for contracts
        options={VEX_ACTIONS.map((action, i) => ({
          value: { address: action.address, key: i },
          label: action.contract,
        }))}
        depth={0}
      />

      {contract ? (
        // Function selector
        <>
          <Spacer height="20" />
          <Selector
            value={func}
            onChangeHandler={setFunc}
            placeholder={`Select ${contract.label} function...`}
            // Filter all actions, by selected contract, for functions
            options={VEX_ACTIONS[contract.value.key].functions.map(
              (func, i) => ({
                value: { signature: func.signature, key: i },
                label: func.name,
              })
            )}
            depth={1}
          />
        </>
      ) : null}

      {VEX_ACTIONS[contract?.value.key]?.functions[func?.value.key] ? (
        // If both contract and function selected, show inputs for args
        <>
          {VEX_ACTIONS[contract.value.key].functions[
            func.value.key
            // Filter for all args under contract + function
          ].args.map((arg, i) => {
            return (
              <>
                <Spacer height="20" />
                <ActionInputWithSideLabel
                  key={i}
                  labelTitle={arg.name}
                  value={args[i]}
                  type={arg.type}
                  placeholder={arg.placeholder}
                  onChangeHandler={updateArgsAtIndex}
                  onChangeIndex={i}
                />
              </>
            );

          })}

          {VEX_ACTIONS[contract.value.key].functions[func.value.key].values.map(
            // Filter for all values under contract + function
            (value, i) => {
              return (
                <>
                  <Spacer height="20" />
                  <ActionInputWithSideLabel
                    key={i}
                    labelTitle={value.name}
                    value={values[i]}
                    type={value.type}
                    placeholder={value.placeholder}
                    onChangeHandler={updateValuesAtIndex}
                    onChangeIndex={i}
                  />
                </>
              );
            }
          )}
        </>
      ) : null}
    </div>
  );
}
