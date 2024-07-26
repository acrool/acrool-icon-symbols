import {modal} from '@acrool/react-modal';
import AcroolTable from '@acrool/react-table';
import {useNavigate} from 'react-router-dom';

import {PromotionModal, PromotionModalArgs, PromotionModalPartialArgs} from '../../viewModal/PromotionModal';
import SliderRight from '../../viewModal/SliderRight';
import SliderLeft from '../../viewModal/SliderLeft';
import SliderUp from '../../viewModal/SliderUp';


const Example = () => {
    const navigate = useNavigate();

    // const [visible, setVisible] = useState<EVisible>(EVisible.none);
    // const [isVisible, setVisible] = useState<boolean>(false);

    // const MyModel = CreateTaskModal;

    return <div className="d-flex gap-3 w-100">

        <AcroolTable
            isDark
            isVisiblePaginate={false}
            tableCellMediaSize={768}
            gap="10px"
            title={{
                name: {text: 'Name', col: '450px'},
                use: {text: 'Use', col: true},
            }}
            data={[
                {
                    id: 1,
                    onClickRow: () => {
                        PromotionModal.show();
                    },
                    field: {
                        name: 'Fast Show',
                        use: 'PromotionModal.show()',
                    }
                },
                {
                    id: 2,
                    onClickRow: () => {
                        PromotionModalArgs.show({myVar: 'xx'});
                    },
                    field: {
                        name: 'Fast Show Args',
                        use: 'PromotionModal.showArgs({myVar: \'Imagine\'})',
                    }
                },
                {
                    id: 3,
                    onClickRow: () => {
                        PromotionModalPartialArgs.show({myVar: 'x'});
                    },
                    field: {
                        name: 'Origin Show Partial Args',
                        use: 'modal.show(PromotionModal.FC, {myVar: \'Imagine\'})',
                    }
                },
                {
                    id: 4,
                    onClickRow: () => {
                        modal.show(PromotionModal, undefined);
                    },
                    field: {
                        name: 'Origin Show',
                        use: 'modal.show(PromotionModal)',
                    }
                },
                {
                    id: 5,
                    onClickRow: () => {
                        modal.show(PromotionModalArgs, {myVar: 'Imagine'});
                    },
                    field: {
                        name: 'Origin Show Args',
                        use: 'modal.show(PromotionModal.FC, {myVar: \'Imagine\'})',
                    }
                },
                {
                    id: 6,
                    onClickRow: () => {
                        navigate({hash: '/control/editAccount/1'});
                    },
                    field: {
                        name: 'Hash Modal 1',
                        use: 'navigate({hash: \'/control/editAccount/1\'})',
                    }
                },
                {
                    id: 7,
                    onClickRow: () => {
                        navigate({hash: '/control/editAccount/2'});
                    },
                    field: {
                        name: 'Hash Modal 2',
                        use: 'navigate({hash: \'/control/editAccount/2\'})',
                    }
                },
                {
                    id: 8,
                    onClickRow: () => {
                        navigate({hash: '/control/editPassword'});
                    },
                    field: {
                        name: 'Hash Modal Diff',
                        use: 'navigate({hash: \'/control/editPassword\'})',
                    }
                },
                {
                    id: 9,
                    onClickRow: SliderRight.show,
                    field: {
                        name: 'Slider Right Show',
                        use: 'SliderRight.show',
                    }
                },
                {
                    id: 10,
                    onClickRow: SliderLeft.show,
                    field: {
                        name: ' Slider Left Show',
                        use: 'SliderLeft.show',
                    }
                },
                {
                    id: 11,
                    onClickRow: () => SliderUp.show(),
                    field: {
                        name: ' Slider Up Show',
                        use: 'SliderUp.show',
                    }
                },
            ]}
        />


        {/*<PromotionModal.FC myVar="image"/>*/}
        {/*<PromotionBaseModal myVar="image"/>*/}
        {/*<BaseModal myVar="XXXXX"/>*/}
        {/*<CreateTaskModal*/}
        {/*    onClose={() => setVisible(EVisible.none)}*/}
        {/*/>*/}

        {/*{isVisible &&*/}
        {/*    <CreateTaskModal*/}
        {/*        onExitComplete={() => {*/}
        {/*            console.log('close');*/}
        {/*            setVisible(false);*/}
        {/*        }}*/}
        {/*    />*/}
        {/*}*/}



    </div>;
};

export default Example;




