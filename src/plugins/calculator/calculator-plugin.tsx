import { Button } from "@components/Button";
import { AnoriPlugin, OnCommandInputCallback, WidgetRenderProps, WidgetDescriptor } from "@utils/user-data/types";
import './styles.scss';
import { useWidgetMetadata } from "@utils/plugin";
import { translate } from "@translations/index";
import { useTranslation } from "react-i18next";
import Mexp from 'math-expression-evaluator';
import { Ref, useRef, useState } from "react";
import { Input } from "@components/Input";
import clsx from "clsx";
import { ScrollArea } from "@components/ScrollArea";
import { guid } from "@utils/misc";
import { useRunAfterNextRender } from "@utils/hooks";
import { AnimatePresence } from "framer-motion";
import { WidgetExpandArea } from "@components/WidgetExpandArea";
import { Icon } from "@components/Icon";
import { useSizeSettings } from "@utils/compact";

type CalculatorWidgetConfigType = {

};

const mexp = new Mexp();
const evaluate = (expression: string) => {
    const lexed = mexp.lex(expression, [
        { token: 'sqrt', show: 'sqrt', type: 0, value: Math.sqrt, precedence: 11 },
        { token: 'mod', show: ' mod ', type: 2, value: mexp.math.mod, precedence: 3 },
    ]);
    const postfixed = mexp.toPostfix(lexed);
    const result = mexp.postfixEval(postfixed, {});
    return result;
}

const Calculator = ({ showAdditionalButtons, showHistory, inputRef }: { showAdditionalButtons: boolean, showHistory: boolean, inputRef?: Ref<HTMLInputElement> }) => {
    const doCalc = () => {
        // Would be cool to use mathjs once we get lazy loading working properly
        // https://mathjs.org/

        try {
            const result = evaluate(expression);
            setResult(result.toString());
            setExpression(result.toString());
            setHistory(prev => [...prev, {
                exp: expression,
                result: result.toString(),
                id: guid(),
            }]);
            runAfterRender(() => {
                historyRef.current?.scrollTo({
                    top: historyRef.current.scrollHeight,
                    behavior: 'smooth'
                });
            })
        } catch (err) {
            console.log(err);
            setResult(t('calculator-plugin.cantCalc'));
        }

    };

    const addToExp = (val: string) => () => {
        setExpression(p => p + val);
    }

    const [expression, setExpression] = useState('');
    const [result, setResult] = useState('0');
    const [history, setHistory] = useState<{ exp: string, result: string, id: string }[]>([]);
    const historyRef = useRef<HTMLDivElement>(null);
    const runAfterRender = useRunAfterNextRender();
    const { t } = useTranslation();

    return (<div className={clsx("Calculator")}>
        {showHistory && <div className="history-wrapper"><ScrollArea type="hover" color="dark" viewportRef={historyRef}>
            <div className="history">
                {history.map(({ exp, result, id }) => {
                    return (<div className="history-record" key={id}>
                        <span className="expression-shaded">{exp}</span>
                        <span className="expression-shaded">=</span>
                        <span>{result}</span>
                    </div>)
                })}
            </div>
        </ScrollArea></div>}
        <div className="result">{result}</div>
        <Input value={expression} ref={inputRef} onValueChange={setExpression} onKeyDown={(e) => {
            if (['Enter', '='].includes(e.key)) {
                e.preventDefault();
                doCalc();
            }
        }} />

        <div className={clsx("calc-buttons", showAdditionalButtons && "with-additional-buttons", !showHistory && "all-height")}>
            {showAdditionalButtons && <>
                <Button onClick={addToExp('sin(')}>sin</Button>
                <Button onClick={addToExp('cos(')}>cos</Button>
                <Button onClick={addToExp('tan(')}>tan</Button>
            </>}
            <Button onClick={() => setExpression('')}>C</Button>
            <Button onClick={addToExp('(')}>(</Button>
            <Button onClick={addToExp(')')}>)</Button>
            <Button onClick={addToExp('%')}>%</Button>

            {showAdditionalButtons && <>
                <Button onClick={addToExp('asin(')}>asin</Button>
                <Button onClick={addToExp('acos(')}>acos</Button>
                <Button onClick={addToExp('atan(')}>atan</Button>
            </>}
            <Button onClick={addToExp('7')}>7</Button>
            <Button onClick={addToExp('8')}>8</Button>
            <Button onClick={addToExp('9')}>9</Button>
            <Button onClick={addToExp('/')}>÷</Button>

            {showAdditionalButtons && <>
                <Button onClick={addToExp('^2')}><span>x<sup>2</sup></span></Button>
                <Button onClick={addToExp('^')}><span>x<sup>y</sup></span></Button>
                <Button onClick={addToExp('sqrt(')}>√</Button>

            </>}
            <Button onClick={addToExp('4')}>4</Button>
            <Button onClick={addToExp('5')}>5</Button>
            <Button onClick={addToExp('6')}>6</Button>
            <Button onClick={addToExp('*')}>×</Button>

            {showAdditionalButtons && <>
                <Button onClick={addToExp('ln(')}>ln</Button>
                <Button onClick={addToExp('log(')}>log</Button>
                <Button onClick={addToExp('Mod')}>Mod</Button>
            </>}
            <Button onClick={addToExp('1')}>1</Button>
            <Button onClick={addToExp('2')}>2</Button>
            <Button onClick={addToExp('3')}>3</Button>
            <Button onClick={addToExp('-')}>-</Button>

            {showAdditionalButtons && <>
                <Button onClick={addToExp('!')}>!</Button>
                <Button onClick={addToExp('pi')}>π</Button>
                <Button onClick={addToExp('e')}>e</Button>
            </>}
            <Button onClick={addToExp('0')}>0</Button>
            <Button onClick={addToExp('.')}>.</Button>
            <Button onClick={doCalc}>=</Button>
            <Button onClick={addToExp('+')}>+</Button>

        </div>
    </div>)
};

const MainScreen = ({ config, instanceId }: WidgetRenderProps<CalculatorWidgetConfigType>) => {
    const meta = useWidgetMetadata();
    
    return (<div className="CalculatorWidget">
        <Calculator showAdditionalButtons={meta.size.width > 2} showHistory={meta.size.height > 2} />
    </div>);
};

const MainScreenExpandable = ({ config, instanceId }: WidgetRenderProps<CalculatorWidgetConfigType>) => {
    const [show, setShow] = useState(false);
    const { rem } = useSizeSettings();
    const runAfterRender = useRunAfterNextRender();
    const inputRef = useRef<HTMLInputElement>(null);

    return (<>
        <div className="CalculatorWidgetExpandable" onClick={() => {
            setShow(true);
            runAfterRender(() => {
                inputRef.current?.focus();
            })
        }}>
            <Icon icon='ion:calculator' width={rem(5)} height={rem(5)} />
        </div>
        <AnimatePresence>
            {show && <WidgetExpandArea className="CalculatorWidgetExpandArea" onClose={() => setShow(false)}>
                <Calculator showAdditionalButtons showHistory inputRef={inputRef} />
            </WidgetExpandArea>}
        </AnimatePresence>
    </>);
};

const onCommandInput: OnCommandInputCallback = async (text: string) => {
    const force = text.startsWith('=');
    const exp = force ? text.slice(1) : text;
    try {
        const result = evaluate(exp);
        return [{
            icon: 'ion:calculator',
            text: result.toString(),
            key: result.toString(),
            onSelected: () => {
                navigator.clipboard.writeText(result.toString());
            }
        }]
    } catch (err) {
        if (force) {
            return [{
                icon: 'ion:calculator',
                text: translate('calculator-plugin.cantCalc'),
                key: 'cant-parse',
                onSelected: () => {}
            }]
        }
        return [];
    }
};

const widgetDescriptor = {
    id: 'calc-widget',
    get name() {
        return translate('calculator-plugin.name');
    },
    configurationScreen: null,
    mainScreen: MainScreen,
    mock: () => {
        return (<MainScreen instanceId="mock" config={{}} />)
    },
    appearance: {
        size: {
            width: 2,
            height: 2,
        },
        resizable: {
            min: {
                width: 2,
                height: 2,
            },
            max: {
                width: 3,
                height: 5,
            }
        },
    }
} as const satisfies WidgetDescriptor<any>;

const expandableWidgetDescriptor = {
    id: 'calc-widget-expandable',
    get name() {
        return translate('calculator-plugin.expandWidgetName');
    },
    configurationScreen: null,
    mainScreen: MainScreenExpandable,
    mock: () => {
        return (<MainScreenExpandable instanceId="mock" config={{}} />)
    },
    appearance: {
        size: {
            width: 1,
            height: 1,
        },
        resizable: false,
        withHoverAnimation: true,
    }
} as const satisfies WidgetDescriptor<any>;

export const calculatorPlugin = {
    id: 'calculator-plugin',
    get name() {
        return translate('calculator-plugin.name');
    },
    widgets: [
        widgetDescriptor,
        expandableWidgetDescriptor,
    ],
    onCommandInput,
    configurationScreen: null,
} satisfies AnoriPlugin;